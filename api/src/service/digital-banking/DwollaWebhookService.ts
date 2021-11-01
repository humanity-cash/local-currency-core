import * as dwolla from "dwolla-v2";
import { DwollaEvent } from "./DwollaTypes";
import { newWallet } from "../contracts";
import { log, userNotification } from "src/utils";
import {
  duplicateWebhookExists,
  getAppToken,
  getDwollaResourceFromEvent,
  getDwollaCustomerFromEvent,
} from "./DwollaUtils";
import {
  DwollaEventService,
  DwollaTransferService,
} from "src/database/service";
import { webhookMint } from "../OperatorService";

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
    await deregisterAllWebhooks();
    const appToken: dwolla.Client = await getAppToken();
    const webhook = {
      url: process.env.WEBHOOK_URL,
      secret: process.env.WEBHOOK_SECRET,
    };
    const response: dwolla.Response = await appToken.post(
      process.env.DWOLLA_BASE_URL + "webhook-subscriptions/",
      webhook
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

function logUnsupported(topic: string) {
  log(
    `DwollaWebhookService.ts::consumeWebhook() Unsupported ${topic} received, nothing to do...`
  );
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
    userNotification(customer.id, message, level);
  } catch (err) {
    log(
      `DwollaWebhookService.ts::consumeWebhook()error during ${event.topic} topic processing ${err}`
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

      case "customer_bank_transfer_created":
        try {
          await notifyUserWithReason(
            eventToProcess,
            "Your bank transfer has been created"
          );
          await DwollaTransferService.updateStatus(
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

      case "customer_bank_transfer_cancelled":
        try {
          await notifyUserWithReason(
            eventToProcess,
            "Your bank transfer has been cancelled\nPlease contact support for assistance",
            "ERR"
          );
          await DwollaTransferService.updateStatus(
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
          await DwollaTransferService.updateStatus(
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
          await DwollaTransferService.updateStatus(
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

      case "customer_bank_transfer_completed":
        logUnsupported(eventToProcess.topic);
        break;

      case "customer_transfer_created":
        try {
          await notifyUserWithReason(eventToProcess, "Bank transfer created");
          await DwollaTransferService.updateStatus(
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
          await DwollaTransferService.updateStatus(
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
          await DwollaTransferService.updateStatus(
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

      case "customer_transfer_completed":
        try {
          const transfer = await getDwollaResourceFromEvent(eventToProcess);
          log(
            `DwollaWebhookService.ts::consumeWebhook() Event refers to transfer ${JSON.stringify(
              transfer,
              null,
              2
            )}`
          );
          const transferDBItem = await DwollaTransferService.getById(
            transfer.body.id
          );
          log(
            `DwollaWebhookService.ts::consumeWebhook() Event refers to database transfer ${JSON.stringify(
              transferDBItem,
              null,
              2
            )}`
          );

          if (!transferDBItem)
            throw `DwollaWebhookService.ts::consumeWebhook() Database record for this event does not exist yet, is there a timing issue?`;

          // Notify user of transfer completion
          await notifyUserWithReason(
            eventToProcess,
            `Your ${
              transferDBItem.type == "DEPOSIT" ? "deposit" : "withdrawal"
            } of ${"$" + transferDBItem.amount} has completed successfully`
          );

          // If deposit, then mint new Berkshares
          if (transferDBItem.type == "DEPOSIT") {
            webhookMint(transferDBItem.id);
          }

          // Update DB item to show completed status
          await DwollaTransferService.updateStatus(
            transfer.body.id,
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
