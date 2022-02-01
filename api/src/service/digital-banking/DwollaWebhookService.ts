import * as dwolla from "dwolla-v2";
import { DwollaEvent } from "./DwollaTypes";
import { newWallet, transferLaunchPoolBonus } from "../contracts";
import {
  isDwollaProduction,
  log,
  shouldDeletePriorWebhooks,
  userNotification,
} from "src/utils";
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
  LaunchPromotionService,
} from "src/database/service";
import { webhookMint } from "../OperatorService";
import { updateWalletAddress } from "../AuthService";
import { getFundingSourcesById } from "./DwollaService";

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

function getProgressMessageForTransfer(
  transfer: DwollaTransferService.IDwollaTransferDBItem
): string {
  const outOf = 4;

  log(
    `DwollaWebhookServices()::getProgressMessageForTransfer() Statuses for this ${transfer.type} are: fundingStatus ${transfer.fundingStatus}, fundedStatus ${transfer.fundedStatus}`
  );

  let progress = 0;

  if (transfer.fundingStatus) {
    progress =
      progress + (transfer.fundingStatus?.includes("completed") ? 2 : 1);
  }
  if (transfer.fundedStatus) {
    progress =
      progress + (transfer.fundedStatus?.includes("completed") ? 2 : 1);
  }

  const type: string = transfer.type == "DEPOSIT" ? "deposit" : "withdrawal";
  let message = `Your ${type} of $${transfer.amount} has progressed (${progress}/${outOf})`;
  if (progress == outOf) {
    message = `Your ${type} of $${transfer.amount} has completed (${progress}/${outOf})`;
  }
  return message;
}

async function contactSupport(event: DwollaEvent): Promise<void> {
  await notifyUserWithReason(
    event,
    "Your account has encountered a problem that cannot be resolved automatically\nPlease contact support",
    "ERR"
  );
}

async function processTransfer(eventToProcess: DwollaEvent): Promise<boolean> {
  try {
    log(
      `DwollaWebhookService.ts::processTransfer() EventId ${eventToProcess.id}: Begin processing...`
    );

    // Get this transfer, in theory this should never fail
    const transferDwollaObject = await getDwollaResourceFromEvent(
      eventToProcess
    );
    // log(
    //   `DwollaWebhookService.ts::processTransfer() EventId ${
    //     eventToProcess.id
    //   }: Found transfer in Dwolla, object is ${JSON.stringify(
    //     transferDwollaObject,
    //     null,
    //     2
    //   )}`
    // );

    // 1 Get transferDBObject and update status
    let transferDBOject: DwollaTransferService.IDwollaTransferDBItem;
    try {
      // 1A Attempt to get transfer from database for logging by fundingTransferId
      transferDBOject = await DwollaTransferService.getByFundingTransferId(
        eventToProcess.resourceId
      );
      log(
        `DwollaWebhookService.ts::processTransfer() EventId ${
          eventToProcess.id
        }: Found transfer in database by fundingTransferId, object is ${JSON.stringify(
          transferDBOject,
          null,
          2
        )}`
      );

      // 1B Update the status of the transfer to the current topic
      await DwollaTransferService.updateStatusByFundingTransferId(
        eventToProcess.resourceId,
        eventToProcess.topic
      );
      log(
        `DwollaWebhookService.ts::processTransfer() EventId ${eventToProcess.id}: Updated status of transfer with fundingTransferId ${eventToProcess.resourceId} to ${eventToProcess.topic}`
      );

      // 1C Update the fundedTransferId on the database, if it doesn't exist yet
      if (!transferDBOject.fundedTransferId) {
        log(
          `DwollaWebhookService.ts::processTransfer() EventId ${eventToProcess.id}: fundedTransferId has not been set in our database for fundingTransferId ${eventToProcess.resourceId}`
        );
        const fundedTransferLink =
          transferDwollaObject.body?._links["funded-transfer"]?.href;
        if (fundedTransferLink) {
          log(
            `DwollaWebhookService.ts::processTransfer() EventId ${eventToProcess.id}: However, fundedTransferId does exist in the _links for this fundingTransferId ${eventToProcess.resourceId}`
          );
          const fundedTransferDwollaObject =
            await getDwollaResourceFromLocation(fundedTransferLink);
          if (fundedTransferDwollaObject) {
            log(
              `DwollaWebhookService.ts::processTransfer() EventId ${eventToProcess.id}: Successfully retrieved Dwolla object from link ${fundedTransferLink}`
            );
            await DwollaTransferService.setFundedTransferId(
              transferDBOject.fundingTransferId,
              fundedTransferDwollaObject?.body?.id
            );
            log(
              `DwollaWebhookService.ts::processTransfer() EventId ${eventToProcess.id}: Successfully updated database with fundedTransferId ${fundedTransferDwollaObject?.body?.id} for fundingTransferId ${eventToProcess.resourceId}`
            );
          } else {
            const message = `DwollaWebhookService.ts::processTransfer() EventId ${eventToProcess.id}: Error, we had a fundedTransferLink but could not retrieve the object from Dwolla`;
            log(message);
            throw message;
          }
        } else {
          log(
            `DwollaWebhookService.ts::processTransfer() EventId ${eventToProcess.id}: We haven't set a fundedTransferId yet for this transfer, but no link exists yet on the Dwolla object, nothing to do yet...`
          );
        }
      } else {
        log(
          `DwollaWebhookService.ts::processTransfer() EventId ${eventToProcess.id}: fundedTransferId ${transferDBOject.fundedTransferId} already set for fundingTransferId ${transferDBOject.fundingTransferId}, no need to set it again`
        );
      }
      // Retrieve again from database to ensure it's up to date
      transferDBOject = await DwollaTransferService.getByFundingTransferId(
        eventToProcess.resourceId
      );
    } catch (err) {
      // If ths object doesn't exist by fundingTransferId, it should exist by fundedTransferId
      if (err?.message?.includes("No match in database")) {
        log(
          `DwollaWebhookService.ts::processTransfer() EventId ${eventToProcess.id}: No match in database, so switching to fundedTransferId search`
        );

        // 1D Attempt to get transfer from database for logging by fundedTransferId
        transferDBOject = await DwollaTransferService.getByFundedTransferId(
          eventToProcess.resourceId
        );
        log(
          `DwollaWebhookService.ts::processTransfer() EventId ${
            eventToProcess.id
          }: Found transfer in database by fundedTransferId, object is ${JSON.stringify(
            transferDBOject,
            null,
            2
          )}`
        );

        // 1E Update the status of the transfer to the current topic
        await DwollaTransferService.updateStatusByFundedTransferId(
          eventToProcess.resourceId,
          eventToProcess.topic
        );
        log(
          `DwollaWebhookService.ts::processTransfer() EventId ${eventToProcess.id}: Updated status of transfer with fundedTransferId ${eventToProcess.resourceId} to ${eventToProcess.topic}`
        );

        // 1E Update the fundedTransferId on the database, if it doesn't exist yet
        if (!transferDBOject.fundingTransferId) {
          log(
            `DwollaWebhookService.ts::processTransfer() EventId ${eventToProcess.id}: fundingTransferId has not been set in our database for fundedTransferId ${eventToProcess.resourceId}`
          );
          const fundingTransferLink =
            transferDwollaObject.body?._links["funding-transfer"]?.href;
          if (fundingTransferLink) {
            log(
              `DwollaWebhookService.ts::processTransfer() EventId ${eventToProcess.id}: However, fundingTransferId does exist in the _links for this fundedTransferId ${eventToProcess.resourceId}`
            );
            const fundingTransferDwollaObject =
              await getDwollaResourceFromLocation(fundingTransferLink);
            if (fundingTransferDwollaObject) {
              log(
                `DwollaWebhookService.ts::processTransfer() EventId ${eventToProcess.id}: Successfully retrieved Dwolla object from link ${fundingTransferLink}`
              );
              await DwollaTransferService.setFundingTransferId(
                transferDBOject.fundedTransferId,
                fundingTransferDwollaObject?.body?.id
              );
              log(
                `DwollaWebhookService.ts::processTransfer() EventId ${eventToProcess.id}: Successfully updated database with fundingTransferId ${fundingTransferDwollaObject?.body?.id} for fundedTransferId ${eventToProcess.resourceId}`
              );
            } else {
              const message = `DwollaWebhookService.ts::processTransfer() EventId ${eventToProcess.id}: Error, we had a fundingTransferLink but could not retrieve the object from Dwolla`;
              log(message);
              throw message;
            }
          } else {
            log(
              `DwollaWebhookService.ts::processTransfer() EventId ${eventToProcess.id}: We haven't set a fundingTransferId yet for this transfer, but no link exists yet on the Dwolla object, nothing to do yet...`
            );
          }
        } else {
          log(
            `DwollaWebhookService.ts::processTransfer() EventId ${eventToProcess.id}: fundingTransferId ${transferDBOject.fundingTransferId} already set for fundedTransferId ${transferDBOject.fundedTransferId}, no need to set it again`
          );
        }

        transferDBOject = await DwollaTransferService.getByFundedTransferId(
          eventToProcess.resourceId
        );
      } else {
        log(
          `DwollaWebhookService.ts::processTransferCreated() Unknown error during ${eventToProcess.topic} processing ${err}`
        );
        throw err;
      }
    }

    // 2 Status reconciliation
    const fundedTransferLink =
      transferDwollaObject.body?._links["funded-transfer"]?.href;
    const fundingTransferLink =
      transferDwollaObject.body?._links["funding-transfer"]?.href;
    const fundingTransferIdFromDB = transferDBOject.fundingTransferId;
    const fundedTransferIdFromDB = transferDBOject.fundedTransferId;
    const fundedTransferStatusFromDB = transferDBOject.fundedStatus;
    const fundingTransferStatusFromDB = transferDBOject.fundingStatus;

    log(
      `DwollaWebhookService.ts::processTransfer() EventId ${eventToProcess.id}: --- Status reconciliation --------------------------------------`
    );
    log(
      `DwollaWebhookService.ts::processTransfer() EventId ${eventToProcess.id}: type ${transferDBOject.type}`
    );
    log(
      `DwollaWebhookService.ts::processTransfer() EventId ${eventToProcess.id}: userId ${transferDBOject.userId}`
    );
    log(
      `DwollaWebhookService.ts::processTransfer() EventId ${eventToProcess.id}: amount ${transferDBOject.amount}`
    );

    log(
      `DwollaWebhookService.ts::processTransfer() EventId ${eventToProcess.id}: fundingTransferLink ${fundingTransferLink}`
    );
    log(
      `DwollaWebhookService.ts::processTransfer() EventId ${eventToProcess.id}: fundingTransferIdFromDB ${fundingTransferIdFromDB}`
    );
    log(
      `DwollaWebhookService.ts::processTransfer() EventId ${eventToProcess.id}: fundingTransferStatusFromDB ${fundingTransferStatusFromDB}`
    );

    log(
      `DwollaWebhookService.ts::processTransfer() EventId ${eventToProcess.id}: fundedTransferLink ${fundedTransferLink}`
    );
    log(
      `DwollaWebhookService.ts::processTransfer() EventId ${eventToProcess.id}: fundedTransferIdFromDB ${fundedTransferIdFromDB}`
    );
    log(
      `DwollaWebhookService.ts::processTransfer() EventId ${eventToProcess.id}: fundedTransferStatusFromDB ${fundedTransferStatusFromDB}`
    );

    // 3 If both legs are complete
    if (
      fundingTransferStatusFromDB?.includes("completed") &&
      fundedTransferStatusFromDB?.includes("completed")
    ) {
      log(
        `DwollaWebhookService.ts::processTransfer() EventId ${eventToProcess.id}: Both legs of this transfer are completed, this transfer can be considered complete`
      );
      if (transferDBOject.type == "DEPOSIT") {
        log(
          `DwollaWebhookService.ts::processTransfer() EventId ${eventToProcess.id}: This transfer is a deposit, now minting BerkShares...`
        );
        const success = await webhookMint(transferDBOject.fundingTransferId);
        if(!success){
          await contactSupport(eventToProcess);
          return true;
        }
      } else {
        log(
          `DwollaWebhookService.ts::processTransfer() EventId ${eventToProcess.id}: This transfer is a withdrawal, transfer is fully complete and nothing more to do`
        );
      }
    }

    // 4 Notify the user
    const notificationMessage = getProgressMessageForTransfer(transferDBOject);
    log(
      `DwollaWebhookService.ts::processTransfer() EventId ${eventToProcess.id}: ${notificationMessage}`
    );
    await userNotification(transferDBOject.userId, notificationMessage, "INFO");

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
          const updateResponse = await updateWalletAddress({
            walletAddress: address,
            dwollaId: customer.id,
          });
          if (updateResponse?.success)
            log(`Updated user ${customer?.id} wallet address to ${address}`);
          if (!updateResponse?.success)
            log(
              `Failed to update user ${customer?.id} wallet address to ${address}: ${updateResponse?.error}`
            );
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
        processed = true;
        break;

      case "customer_funding_source_verified":
        try {
          await notifyUserWithReason(
            eventToProcess,
            "Your bank account has been verified and linked"
          );
          const res = await getDwollaCustomerFromEvent(eventToProcess);
          const customer = res.body;
          const fundingSources = await getFundingSourcesById(customer.id);
          let fingerprint =
            fundingSources?.body?._embedded["funding-sources"][0].fingerprint;

          if (!isDwollaProduction()) {
            // In sandbox, fingerprints are not fully unique
            fingerprint = fingerprint + customer.id;
          }

          log(
            `Funding source verified for user ${customer.id}, with fingerprint ${fingerprint}`
          );
          const launchPromotionRecord =
            await LaunchPromotionService.findByFingerprint(fingerprint);

          if (!launchPromotionRecord) {
            log(
              `Funding source with fingerprint ${fingerprint} has not had promotional value applied`
            );
            const promotionsApplied = await LaunchPromotionService.getCount();
            log(`Number fo promotions applied so far is ${promotionsApplied}`);

            if (promotionsApplied < 5000) {
              log(
                `Applying promotional bonus of B$10 to user ${customer.id} with funding source fingerprint ${fingerprint}`
              );
              const launchPoolBonusTransferred = await transferLaunchPoolBonus(
                customer.id
              );
              if (launchPoolBonusTransferred) {
                await LaunchPromotionService.create({
                  fingerprint: fingerprint,
                  promotionAmount: "10.0",
                });
                await notifyUserWithReason(
                  eventToProcess,
                  "Thank you for linking your bank account! You've received a promotional deposit of B$10"
                );
              }
            } else {
              log(
                `${promotionsApplied} promotions have already been applied, no more can be spent, skipping`
              );
            }
          } else {
            log(
              `Funding source with fingerprint ${fingerprint} has already had promotional amount applied, skipping launch promotion`
            );
          }
          processed = true;
        } catch (err) {
          log(
            `DwollaWebhookService.ts::consumeWebhook() Error during ${eventToProcess.topic} topic processing ${err}`
          );
          throw err;
        }
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
        processed = await processTransfer(eventToProcess);
        break;

      case "customer_transfer_completed":
        processed = await processTransfer(eventToProcess);
        break;

      case "customer_bank_transfer_created":
        processed = await processTransfer(eventToProcess);
        break;

      case "customer_bank_transfer_completed":
        processed = await processTransfer(eventToProcess);
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
