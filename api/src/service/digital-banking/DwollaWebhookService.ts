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
  log(
    `DwollaWebhookServices()::getProgressMessageForTransfer() Statuses for this ${transfer.type} are: fundingStatus ${transfer.fundingStatus}, fundedStatus ${transfer.fundedStatus}`
  );

  const fundingTransferComplete = transfer.fundingStatus?.includes("completed");
  const fundedTransferCompleted = transfer.fundedStatus?.includes("completed");
  const type: string = transfer.type == "DEPOSIT" ? "deposit" : "withdrawal";
  let message = `Your ${type} of $${transfer.amount} is still in flight and has progressed further...`;

  if (fundedTransferCompleted && fundingTransferComplete) {
    message = `Your ${type} of $${transfer.amount} has completed!`;
  }
  return message;
}

async function contactSupport(event: DwollaEvent): Promise<void> {
  await notifyUserWithReason(
    event,
    "Your account has encountered a problem that cannot be resolved automatically. Please contact support",
    "ERR"
  );
}

function logTransferStatus(
  transferDwollaObject: dwolla.Response,
  transferDBObject: DwollaTransferService.IDwollaTransferDBItem,
  detailedLog: (logMessage: string) => void
): void {
  const fundedTransferLink =
    transferDwollaObject.body?._links["funded-transfer"]?.href;
  const fundingTransferLink =
    transferDwollaObject.body?._links["funding-transfer"]?.href;
  const fundingTransferIdFromDB = transferDBObject.fundingTransferId;
  const fundedTransferIdFromDB = transferDBObject.fundedTransferId;
  const fundedTransferStatusFromDB = transferDBObject.fundedStatus;
  const fundingTransferStatusFromDB = transferDBObject.fundingStatus;

  detailedLog(
    `--- Status reconciliation --------------------------------------`
  );
  detailedLog(`type ${transferDBObject.type}`);
  detailedLog(`userId ${transferDBObject.userId}`);
  detailedLog(`amount ${transferDBObject.amount}`);
  detailedLog(`fundingTransferLink ${fundingTransferLink}`);
  detailedLog(`fundingTransferIdFromDB ${fundingTransferIdFromDB}`);
  detailedLog(`fundingTransferStatusFromDB ${fundingTransferStatusFromDB}`);
  detailedLog(`fundedTransferLink ${fundedTransferLink}`);
  detailedLog(`fundedTransferIdFromDB ${fundedTransferIdFromDB}`);
  detailedLog(`fundedTransferStatusFromDB ${fundedTransferStatusFromDB}`);
}

async function processTransfer(eventToProcess: DwollaEvent): Promise<boolean> {
  const detailedLog = (logMessage: string) => {
    console.log(
      `DwollaWebhookService.ts::processTransfer() EventId ${eventToProcess.id}, ResourceId ${eventToProcess.resourceId}: ${logMessage}`
    );
  };

  const enum DwollaTransferLeg {
    FUNDING,
    FUNDED,
  }
  let transferType: DwollaTransferLeg;

  try {
    detailedLog(`Begin processing...`);

    // ****************************************
    // Get transfer resource from Dwolla
    // ****************************************
    let transferDwollaObject: dwolla.Response;
    try {
      transferDwollaObject = await getDwollaResourceFromEvent(eventToProcess);
    } catch (err) {
      detailedLog("Critical - could not find Dwolla resource");
      throw err;
    }

    let transferDBObject: DwollaTransferService.IDwollaTransferDBItem;

    // ****************************************
    // Find in database by fundingTransferId?
    // ****************************************
    try {
      transferDBObject = await DwollaTransferService.getByFundingTransferId(
        eventToProcess.resourceId
      );
      detailedLog(
        `Found transfer in database by fundingTransferId, object is ${JSON.stringify(
          transferDBObject,
          null,
          2
        )}`
      );
      transferType = DwollaTransferLeg.FUNDING;
    } catch (err) {
      if (err?.message?.includes("No match in database"))
        detailedLog(
          `No match in database when searching by resourceId == fundingTransferId`
        );
      else throw err;
    }

    // ****************************************
    // Find in database by fundedTransferId?
    // ****************************************
    if (!transferDBObject) {
      try {
        transferDBObject = await DwollaTransferService.getByFundedTransferId(
          eventToProcess.resourceId
        );
        detailedLog(
          `DwollaWebhookService.ts::processTransfer() EventId ${
            eventToProcess.id
          }: Found transfer in database by fundedTransferId, object is ${JSON.stringify(
            transferDBObject,
            null,
            2
          )}`
        );
        transferType = DwollaTransferLeg.FUNDED;
      } catch (err) {
        if (err?.message?.includes("No match in database"))
          detailedLog(
            `No match in database when searching by resourceId == fundedTransferId`
          );
        else throw err;
      }
    }

    // ****************************************
    // Try by funding-transfer object link
    //
    // This would mean we never linked the
    // two legs together correctly, due to
    // timing of the Dwolla events
    // ****************************************
    if (!transferDBObject) {
      try {
        const fundingTransferLink =
          transferDwollaObject.body?._links["funding-transfer"]?.href;

        if (fundingTransferLink) {
          detailedLog(
            `There was no funding transfer or funded transfer match, however, a funding-transfer object exists for this resource`
          );
          detailedLog(
            `This means no link was ever made in our database, but the link relationship exists on Dwolla's side`
          );
          detailedLog(
            `Let's make the link in our database, get the object, and continue ...`
          );

          const fundingTransferDwollaObject =
            await getDwollaResourceFromLocation(fundingTransferLink);
          if (fundingTransferDwollaObject) {
            detailedLog(
              `Successfully retrieved Dwolla object from link ${fundingTransferLink}`
            );

            transferDBObject = await DwollaTransferService.setFundedTransferId(
              fundingTransferDwollaObject?.body?.id,
              eventToProcess.resourceId
            );
            transferType = DwollaTransferLeg.FUNDED;
          } else
            throw `Critical - could not find Dwolla resource during funding-transfer link search`;
        } else
          detailedLog(
            `There is no funding-transfer link on this transfer Dwolla resource`
          );
      } catch (err) {
        detailedLog(
          `Error during attempt to use funding-transfer link on a Dwolla resource, we might not have this transfer recorded...`
        );
        throw err;
      }
    }

    // ****************************************
    // Try by funded-transfer object link
    //
    // This would mean we never linked the
    // two legs together correctly, due to
    // timing of the Dwolla events
    // ****************************************
    if (!transferDBObject) {
      try {
        const fundedTransferLink =
          transferDwollaObject.body?._links["funded-transfer"]?.href;

        if (fundedTransferLink) {
          detailedLog(
            `There was no funding transfer or funded transfer match, however, a funded-transfer object exists for this resource`
          );
          detailedLog(
            `This means no link was ever made in our database, but the link relationship exists on Dwolla's side`
          );
          detailedLog(
            `Let's make the link in our database, get the object, and continue ...`
          );

          const fundedTransferDwollaObject =
            await getDwollaResourceFromLocation(fundedTransferLink);
          if (fundedTransferDwollaObject) {
            detailedLog(
              `Successfully retrieved Dwolla object from link ${fundedTransferLink}`
            );

            transferDBObject = await DwollaTransferService.setFundingTransferId(
              fundedTransferDwollaObject?.body?.id,
              eventToProcess.resourceId
            );
            transferType = DwollaTransferLeg.FUNDING;
          } else
            throw `Critical - could not find Dwolla resource during funded-transfer link search`;
        } else
          detailedLog(
            `There is no funded-transfer link on this transfer Dwolla resource`
          );
      } catch (err) {
        detailedLog(
          `Error during attempt to use funded-transfer link on a Dwolla resource, we might not have this transfer recorded...`
        );
        throw err;
      }
    }

    // ****************************************
    // Error check - do we have an object?
    // ****************************************
    if (!transferDBObject) {
      detailedLog(`Cannot find a matching database record for this transfer`);
      detailedLog(
        `This could be a timing issue, e.g. we are still writing to the database and a webhook has instantly appeared before database consistency.`
      );
      detailedLog(
        `Stop execution here, Dwolla will progressively retry the webhook`
      );
      throw `Could not find database record matching this transfer`;
    }

    // ****************************************
    // Funding transfer processing
    // ****************************************
    if (transferType == DwollaTransferLeg.FUNDING) {
      transferDBObject =
        await DwollaTransferService.updateStatusByFundingTransferId(
          eventToProcess.resourceId,
          eventToProcess.topic
        );
      detailedLog(
        `Updated status of transfer with fundingTransferId ${eventToProcess.resourceId} to ${eventToProcess.topic}`
      );

      if (!transferDBObject.fundedTransferId) {
        detailedLog(
          `fundedTransferId has not been set in our database for fundingTransferId ${eventToProcess.resourceId}`
        );
        const fundedTransferLink =
          transferDwollaObject.body?._links["funded-transfer"]?.href;

        if (fundedTransferLink) {
          detailedLog(
            `However, fundedTransferId does exist in the _links for this fundingTransferId ${eventToProcess.resourceId}`
          );
          const fundedTransferDwollaObject =
            await getDwollaResourceFromLocation(fundedTransferLink);

          if (fundedTransferDwollaObject) {
            detailedLog(
              `Successfully retrieved Dwolla object from link ${fundedTransferLink}`
            );
            transferDBObject = await DwollaTransferService.setFundedTransferId(
              transferDBObject.fundingTransferId,
              fundedTransferDwollaObject?.body?.id
            );
            detailedLog(
              `Successfully updated database with fundedTransferId ${fundedTransferDwollaObject?.body?.id} for fundingTransferId ${eventToProcess.resourceId}`
            );
          } else
            throw `Critical - could not find Dwolla resource during funded-transfer link search`;
        } else {
          detailedLog(
            `Haven't set a fundedTransferId yet for this transfer, but no link exists yet on the Dwolla object`
          );
          detailedLog(
            `No issue - link the legs together later when the funded transfer is created and webhook sent by Dwolla`
          );
        }
      } else
        detailedLog(
          `fundedTransferId ${transferDBObject.fundedTransferId} already set for fundingTransferId ${transferDBObject.fundingTransferId}, no need to set it again`
        );
    } // Funding transfer processing

    // ****************************************
    // Funded transfer processing
    // ****************************************
    if (transferType == DwollaTransferLeg.FUNDED) {
      transferDBObject =
        await DwollaTransferService.updateStatusByFundedTransferId(
          eventToProcess.resourceId,
          eventToProcess.topic
        );
      detailedLog(
        `Updated status of transfer with fundedTransferId ${eventToProcess.resourceId} to ${eventToProcess.topic}`
      );

      if (!transferDBObject.fundingTransferId) {
        detailedLog(
          `fundingTransferId has not been set in our database for fundedTransferId ${eventToProcess.resourceId}`
        );
        const fundingTransferLink =
          transferDwollaObject.body?._links["funding-transfer"]?.href;

        if (fundingTransferLink) {
          detailedLog(
            `However, fundingTransferId does exist in the _links for this fundedTransferId ${eventToProcess.resourceId}`
          );
          const fundingTransferDwollaObject =
            await getDwollaResourceFromLocation(fundingTransferLink);

          if (fundingTransferDwollaObject) {
            detailedLog(
              `Successfully retrieved Dwolla object from link ${fundingTransferLink}`
            );
            transferDBObject = await DwollaTransferService.setFundingTransferId(
              transferDBObject.fundedTransferId,
              fundingTransferDwollaObject?.body?.id
            );
            detailedLog(
              `Successfully updated database with fundingTransferId ${fundingTransferDwollaObject?.body?.id} for fundedTransferId ${eventToProcess.resourceId}`
            );
          } else
            throw `Critical - could not find Dwolla resource during funding-transfer link search`;
        } else {
          detailedLog(
            `Haven't set a fundingTransferId yet for this transfer, but no link exists yet on the Dwolla object`
          );
          detailedLog(
            `No issue - link the legs together later when the funding transfer is created and webhook sent by Dwolla`
          );
        }
      } else
        detailedLog(
          `fundingTransferId ${transferDBObject.fundingTransferId} already set for fundedTransferId ${transferDBObject.fundedTransferId}, no need to set it again`
        );
    } // Funded transfer processing

    // ****************************************
    // Log status
    // ****************************************
    logTransferStatus(transferDwollaObject, transferDBObject, detailedLog);

    // ****************************************
    // Completion processing
    // ****************************************
    if (
      transferDBObject?.fundedStatus?.includes("completed") &&
      transferDBObject?.fundingStatus?.includes("completed")
    ) {
      detailedLog(
        `Both legs of this transfer are completed, this transfer can be considered complete`
      );

      if (transferDBObject.type == "DEPOSIT") {
        detailedLog(`This transfer is a deposit, now minting BerkShares...`);
        const success = await webhookMint(transferDBObject.fundingTransferId);
        if (!success) {
          await contactSupport(eventToProcess);
          return true;
        }
      } else
        detailedLog(
          `This transfer is a withdrawal, transfer is fully complete and nothing more to do`
        );
    }

    // Notify the user
    const notificationMessage = getProgressMessageForTransfer(transferDBObject);
    detailedLog(notificationMessage);
    await userNotification(
      transferDBObject.userId,
      notificationMessage,
      "INFO"
    );
    return true;
  } catch (err) {
    detailedLog(
      `Error during ${eventToProcess.topic} processing ${err?.message}}`
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

      case "transfer_created":
        processed = await processTransfer(eventToProcess);
        break;

      case "transfer_completed":
        processed = await processTransfer(eventToProcess);
        break;

      case "bank_transfer_created":
        processed = await processTransfer(eventToProcess);
        break;

      case "bank_transfer_completed":
        processed = await processTransfer(eventToProcess);
        break;

      case "customer_bank_transfer_cancelled":
        try {
          await notifyUserWithReason(
            eventToProcess,
            "Your bank transfer has been cancelled. Please contact support for assistance",
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
            "Your bank transfer has failed. Please contact support for assistance",
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
            "Could not create a bank transfer. Please contact support for assistance",
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
            "Your bank transfer was cancelled. Please contact support for assistance",
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
            "Your bank transfer has failed. Please contact support for assistance",
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

      case "customer_microdeposits_added":
        await notifyUserWithReason(
          eventToProcess,
          "You have opted to link your bank accounts via micro-deposits. Please check your bank account in 1-2 days for two small deposits and return to the app to finalize linking",
          "INFO"
        );
        processed = true;
        break;

      case "customer_microdeposits_failed":
        await notifyUserWithReason(
          eventToProcess,
          "We could not send micro-deposits successfully to the bank account you entered. Please contact support for assistance linking your bank account",
          "ERR"
        );
        processed = true;
        break;

      case "customer_microdeposits_completed":
        await notifyUserWithReason(
          eventToProcess,
          "You have successfully verified your bank account via micro-deposits",
          "INFO"
        );
        processed = true;
        break;

      case "customer_microdeposits_maxattempts":
        await notifyUserWithReason(
          eventToProcess,
          "You have failed micro-deposit verification too many times. Please contact support for assistance linking your bank account",
          "ERR"
        );
        processed = true;
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
