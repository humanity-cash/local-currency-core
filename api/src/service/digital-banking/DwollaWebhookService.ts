import * as dwolla from "dwolla-v2";
import { DwollaEvent } from "./DwollaTypes";
import { newWallet } from "../contracts";
import { log, shouldDeletePriorWebhooks, userNotification } from "src/utils";
import {
  duplicateWebhookExists,
  getAppToken,
  getDwollaResourceFromEvent,
  getDwollaCustomerFromEvent,
  getDwollaResourceFromLocation,
  getIdempotencyHeader,
} from "./DwollaUtils";
import {
  DwollaEventService,
  DwollaTransferService,
} from "src/database/service";
import { webhookMint } from "../OperatorService";
// import { updateWalletAddress } from "../AuthService";

export async function deregisterWebhook(
  webhookUrl: string
): Promise<dwolla.Response> {
  const appToken: dwolla.Client = await getAppToken();
  const response: dwolla.Response = await appToken.delete(webhookUrl);
  log(`Webhook ${webhookUrl} successfully deregistered`);
  return response;
}

async function deregisterAllWebhooks(): Promise<void> {
  const response: dwolla.Response = await getAllWebhooks();
  const webhooks = response.body._embedded["webhook-subscriptions"];

  for (let i = 0; i < webhooks?.length; i++) {
    const webhook = webhooks[i]?._links?.self?.href;
    console.log(`Deregistering webhook ${webhook}`);
    await deregisterWebhook(webhook);
  }
}

export async function registerWebhook(): Promise<string> {
  try {
    if (shouldDeletePriorWebhooks()) await deregisterAllWebhooks();

    const appToken: dwolla.Client = await getAppToken();
    const webhook = {
      url: process.env.WEBHOOK_URL,
      secret: process.env.WEBHOOK_SECRET,
    };
    const response: dwolla.Response = await appToken.post(
      process.env.DWOLLA_BASE_URL + "webhook-subscriptions/",
      webhook,
      getIdempotencyHeader()
    );
    const webhookUrl = response.headers.get("location");
    console.log(
      `Webhook ${webhook.url} successfully registered, location ${webhookUrl}`
    );
    return webhookUrl;
  } catch (err) {
    if (err.body.code == "MaxNumberOfResources") {
      await deregisterAllWebhooks();
      console.log(`Retrying register new webhook...`);
      return await registerWebhook();
    } else throw err;
  }
}

export async function getAllWebhooks(): Promise<dwolla.Response> {
  const appToken: dwolla.Client = await getAppToken();
  const response: dwolla.Response = await appToken.get("webhook-subscriptions");
  return response;
}

function logSupported(topic: string) {
  log(
    `DwollaWebhookService.ts::consumeWebhook() Supported topic ${topic} received and beginning processing...`
  );
}

async function notifyUserWithReason(
  event: DwollaEvent,
  message: string,
  level = "INFO"
): Promise<void> {
  try {
    logSupported(event.topic);
    const res = await getDwollaCustomerFromEvent(event);
    const customer = res.body;
    await userNotification(customer.id, message, level);
  } catch (err) {
    log(
      `DwollaWebhookService.ts::consumeWebhook() error during ${event.topic} topic processing ${err}`
    );
    throw err;
  }
}

async function contactSupport(event: DwollaEvent): Promise<void> {
  await notifyUserWithReason(
    event,
    "Your account has encountered a problem that cannot be resolved automatically\nPlease contact support",
    "ERR"
  );
}

async function updateTransferStatusFromEvent(
  eventToProcess: DwollaEvent,
  transfer: dwolla.Response
): Promise<void> {
  await DwollaTransferService.updateStatusByFundingTransferId(
    eventToProcess.resourceId,
    eventToProcess.topic
  );
  log(
    `DwollaWebhookService.ts::processTransferCompleted() Updated status of transfer fundingTransferId ${eventToProcess.resourceId} to ${eventToProcess.topic}`
  );

  // Search for a secondary funded transfer
  const fundedTransferLink = transfer.body?._links["funded-transfer"]?.href;

  if (fundedTransferLink) {
    // Retreive the funded transfer for logging
    const fundedTransfer: dwolla.Response = await getDwollaResourceFromLocation(
      fundedTransferLink
    );

    // Set the funded transfer ID which links the two legs of the Dwolla transfer together
    await DwollaTransferService.setFundedTransferId(
      eventToProcess.resourceId,
      fundedTransfer.body?.id
    );
    log(
      `DwollaWebhookService.ts::processTransferCompleted() fundedTansferId ${fundedTransfer.body.id} set for fundingTransferId ${eventToProcess.resourceId}`
    );
  }

  await notifyUserWithReason(
    eventToProcess,
    `A funding bank transfer of ${
      transfer.body?.amount?.value
    } related to your account was ${
      eventToProcess.topic.includes("completed") ? "completed" : "created"
    }`
  );
}

async function processTransferCompleted(
  eventToProcess: DwollaEvent
): Promise<boolean> {
  try {
    log(
      `DwollaWebhookService.ts::processTransferCompleted() Processing ${eventToProcess.topic}`
    );

    // Get this transfer
    const transfer = await getDwollaResourceFromEvent(eventToProcess);

    // Attempt to update status in our database
    try {
      await updateTransferStatusFromEvent(eventToProcess, transfer);
    } catch (err) {
      if (err?.message?.includes("No match in database")) {
        // If there is no match for this transfer in our database
        // it means that this bank transfer was created by Dwolla as the matching leg
        // of an existing deposit transfer we initiated from a customer (unverified)
        // to the bank operator (verified) or vice versa

        // We need to use the link of the "funding-transfer" to find the database record
        // and the original transfer we created manually

        const fundingTransferLink =
          transfer.body?._links["funding-transfer"]?.href;
        log(
          `DwollaWebhookService.ts::consumeWebhook() Searching for related funding-transfer ${fundingTransferLink}`
        );

        // Retreive the funding transfer for logging
        const fundingTransfer: dwolla.Response =
          await getDwollaResourceFromLocation(fundingTransferLink);

        // Get the database ID so we can log to the initiating user's notifications
        const transferDBItem =
          await DwollaTransferService.getByFundingTransferId(
            fundingTransfer.body?.id
          );

        // Update the status of the funded transfer ID to the current topic
        await DwollaTransferService.updateStatusByFundedTransferId(
          eventToProcess.resourceId,
          eventToProcess.topic
        );
        // If deposit, then mint new tokens
        if (transferDBItem.type == "DEPOSIT") {
          await webhookMint(transferDBItem.fundingTransferId);
          await userNotification(
            transferDBItem.userId,
            `A deposit of ${fundingTransfer.body?.amount?.value} related to your account was completed`,
            "INFO"
          );
        } else {
          await userNotification(
            transferDBItem.userId,
            `A withdrawal of ${fundingTransfer.body?.amount?.value} related to your account was completed`,
            "INFO"
          );
        }
      } else throw err;
    }
    return true;
  } catch (err) {
    log(
      `DwollaWebhookService.ts::processTransferCreated() Error during ${eventToProcess.topic} processing ${err}`
    );
    throw err;
  }
}

async function processTransferCreated(
  eventToProcess: DwollaEvent
): Promise<boolean> {
  try {
    log(
      `DwollaWebhookService.ts::processTransferCreated() Processing ${eventToProcess.topic}`
    );

    // Get this transfer
    const transfer = await getDwollaResourceFromEvent(eventToProcess);

    // Attempt to update status in our database
    try {
      await updateTransferStatusFromEvent(eventToProcess, transfer);
    } catch (err) {
      if (err?.message?.includes("No match in database")) {
        // If there is no match for this transfer in our database
        // it means that this bank transfer was created by Dwolla as the matching leg
        // of an existing deposit transfer we initiated from a customer (unverified)
        // to the bank operator (verified) or vice versa

        // We need to use the link of the "funding-transfer" to find the database record
        // and the original transfer we created manually

        const fundingTransferLink =
          transfer.body?._links["funding-transfer"]?.href;
        log(
          `DwollaWebhookService.ts::processTransferCreated() Searching for related funding-transfer ${fundingTransferLink}`
        );

        // Retreive the funding transfer for logging
        const fundingTransfer: dwolla.Response =
          await getDwollaResourceFromLocation(fundingTransferLink);

        // Get the database ID so we can log to the initiating user's notifications
        const transferDBItem =
          await DwollaTransferService.getByFundingTransferId(
            fundingTransfer.body?.id
          );
        log(
          `DwollaWebhookService.ts::processTransferCreated() Funding transfer is ${JSON.stringify(
            transferDBItem,
            null,
            2
          )}`
        );

        // Set the funded transfer ID which links the two legs of the Dwolla transfer together
        await DwollaTransferService.setFundedTransferId(
          fundingTransfer.body?.id,
          eventToProcess.resourceId
        );

        // Update the status of the funded transfer ID to the current topic
        await DwollaTransferService.updateStatusByFundedTransferId(
          eventToProcess.resourceId,
          eventToProcess.topic
        );

        // Notify the user the funding leg of their transfer was created
        await userNotification(
          transferDBItem.userId,
          `A funded bank transfer of ${fundingTransfer.body?.amount?.value} related to your account was created`,
          "INFO"
        );
      } else throw err;
    }

    return true;
  } catch (err) {
    log(
      `DwollaWebhookService.ts::processTransferCreated() Error during ${eventToProcess.topic} processing ${err}`
    );
    throw err;
  }
}

export async function consumeWebhook(
  eventToProcess: DwollaEvent
): Promise<boolean> {
  log("Dwolla.consumeWebhook() Processing Event:");
  log(JSON.stringify(eventToProcess, null, 2));

  let processed = false;

  const duplicate: boolean = await duplicateWebhookExists(eventToProcess.id);

  if (!duplicate) {
    switch (eventToProcess.topic) {
      case "customer_created":
        try {
          logSupported(eventToProcess.topic);
          const res = await getDwollaResourceFromEvent(eventToProcess);
          const customer = res.body;
          const address = await newWallet(customer.id);
          // const updateUserWalletAddress = await updateWalletAddress({
          //   walletAddress: address,
          //   dwollaId: customer.id,
          // });
          // // const updateResponse = await retryFunction(updateUserWalletAddress, 3)
          // if (updateUserWalletAddress.success) log(`Updated user ${customer.id} wallet address to ${address}`)
          // if (!updateUserWalletAddress.success) log(`Failed to update user ${customer.id} wallet address to ${address}: ${updateUserWalletAddress.error}`)
          await notifyUserWithReason(
            eventToProcess,
            "Your account has been created"
          );
          log(
            `DwollaWebhookService.ts::consumeWebhook() Address ${address} created on-chain for userId ${customer.id}`
          );
          processed = true;
        } catch (err) {
          log(
            `DwollaWebhookService.ts::consumeWebhook() Error during ${eventToProcess.topic} topic processing ${err}`
          );
          throw err;
        }
        break;

      case "customer_suspended":
        await contactSupport(eventToProcess);
        processed = true;
        break;

      case "customer_activated":
        await notifyUserWithReason(
          eventToProcess,
          "Your account has been reactivated"
        );
        processed = true;
        break;

      case "customer_deactivated":
        await contactSupport(eventToProcess);
        processed = true;
        break;

      case "customer_funding_source_added":
        await notifyUserWithReason(
          eventToProcess,
          "Your bank account has been linked"
        );
        processed = true;
        break;

      case "customer_funding_source_removed":
        await notifyUserWithReason(
          eventToProcess,
          "Your bank account has been removed",
          "WARN"
        );
        processed = true;
        break;

      case "customer_funding_source_unverified":
        await notifyUserWithReason(
          eventToProcess,
          "Your bank account is unverified",
          "WARN"
        );
        processed = true;
        break;

      case "customer_funding_source_negative":
        await notifyUserWithReason(
          eventToProcess,
          "Your bank account is negative",
          "ERR"
        );
        processed = true;
        break;

      case "customer_funding_source_updated":
        await notifyUserWithReason(
          eventToProcess,
          "Your bank account has been updated"
        );
        processed = true;
        break;

      case "customer_transfer_created":
        processed = await processTransferCreated(eventToProcess);
        break;

      case "customer_transfer_completed":
        processed = await processTransferCompleted(eventToProcess);
        break;

      case "customer_bank_transfer_created":
        processed = await processTransferCreated(eventToProcess);
        break;

      case "customer_bank_transfer_completed":
        processed = await processTransferCompleted(eventToProcess);
        break;

      case "customer_bank_transfer_cancelled":
        try {
          await notifyUserWithReason(
            eventToProcess,
            "Your bank transfer has been cancelled\nPlease contact support for assistance",
            "ERR"
          );
          await DwollaTransferService.updateStatusByFundedTransferId(
            eventToProcess.resourceId,
            eventToProcess.topic
          );
          processed = true;
        } catch (err) {
          log(
            `DwollaWebhookService.ts::consumeWebhook() Error during ${eventToProcess.topic} processing ${err}`
          );
          throw err;
        }
        break;

      case "customer_bank_transfer_failed":
        try {
          await notifyUserWithReason(
            eventToProcess,
            "Your bank transfer has failed\nPlease contact support for assistance",
            "ERR"
          );
          await DwollaTransferService.updateStatusByFundedTransferId(
            eventToProcess.resourceId,
            eventToProcess.topic
          );
          processed = true;
        } catch (err) {
          log(
            `DwollaWebhookService.ts::consumeWebhook() Error during ${eventToProcess.topic} processing ${err}`
          );
          throw err;
        }
        break;

      case "customer_bank_transfer_creation_failed":
        try {
          await notifyUserWithReason(
            eventToProcess,
            "Could not create a bank transfer\nPlease contact support for assistance",
            "ERR"
          );
          await DwollaTransferService.updateStatusByFundedTransferId(
            eventToProcess.resourceId,
            eventToProcess.topic
          );
          processed = true;
        } catch (err) {
          log(
            `DwollaWebhookService.ts::consumeWebhook() Error during ${eventToProcess.topic} processing ${err}`
          );
          throw err;
        }
        break;

      case "customer_transfer_cancelled":
        try {
          await notifyUserWithReason(
            eventToProcess,
            "Your bank transfer was cancelled\nPlease contact support for assistance",
            "ERR"
          );
          await DwollaTransferService.updateStatusByFundingTransferId(
            eventToProcess.resourceId,
            eventToProcess.topic
          );
          processed = true;
        } catch (err) {
          log(
            `DwollaWebhookService.ts::consumeWebhook() Error during ${eventToProcess.topic} processing ${err}`
          );
          throw err;
        }
        break;

      case "customer_transfer_failed":
        try {
          await notifyUserWithReason(
            eventToProcess,
            "Your bank transfer has failed\nPlease contact support for assistance",
            "ERR"
          );
          await DwollaTransferService.updateStatusByFundingTransferId(
            eventToProcess.resourceId,
            eventToProcess.topic
          );
          processed = true;
        } catch (err) {
          log(
            `DwollaWebhookService.ts::consumeWebhook() Error during ${eventToProcess.topic} processing ${err}`
          );
          throw err;
        }
        break;

      default:
        throw `Unknown topic ${eventToProcess.topic}, don't know how to process...`;
    }
  }

  if (processed) {
    const result = await DwollaEventService.create({
      eventId: eventToProcess.id,
      resourceId: eventToProcess.resourceId,
      topic: eventToProcess.topic,
      created: eventToProcess.created,
    });
    log(
      "DwollaService.consumeWebhook() Dwolla Event written to database, dbId " +
        result.dbId
    );
  }

  return processed;
}
