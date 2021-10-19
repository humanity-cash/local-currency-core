import crypto from "crypto";
import { Buffer } from "buffer";
import { log } from "src/utils";
import { DwollaClientOptions } from "./DwollaTypes";
import { Client } from "dwolla-v2";
import { DwollaEventService } from "src/database/service";

export async function getAppToken(): Promise<Client> {
  const options: DwollaClientOptions =
    process.env.DWOLLA_ENVIRONMENT == "sandbox"
      ? {
          key: process.env.DWOLLA_APP_KEY,
          secret: process.env.DWOLLA_APP_SECRET,
          environment: "sandbox",
        }
      : {
          key: process.env.DWOLLA_APP_KEY,
          secret: process.env.DWOLLA_APP_SECRET,
          environment: "production",
        };
  return new Client(options);
}

export function createSignature(
  webhookSecret: string,
  payloadBody: string
): string {
  const hash = crypto
    .createHmac("sha256", webhookSecret)
    .update(payloadBody)
    .digest("hex");
  return hash;
}

export function validSignature(
  proposedSignature: string,
  webhookSecret: string,
  payloadBody: string
): boolean {
  try {
    log(
      `DwollaUtils.ts::verifyGatewaySignature: Attempting to validate payloadBody ${payloadBody}...`
    );
    const hash = crypto
      .createHmac("sha256", webhookSecret)
      .update(payloadBody)
      .digest("hex");

    const verified = crypto.timingSafeEqual(
      Buffer.from(proposedSignature),
      Buffer.from(hash)
    );
    log(
      `DwollaUtils.ts::verifyGatewaySignature: event with signature ${proposedSignature} is ${
        verified ? "valid" : "not valid"
      }`
    );
    return verified;
  } catch (e) {
    log(`DwollaUtils.ts::verifyGatewaySignature: ${e}`);
  }
}

// Webhook events can be fired multiple times by Dwolla
// Check for duplicate events in database
export async function duplicateWebhookExists(id: string): Promise<boolean> {
  const webhook = await DwollaEventService.findByObject(id);
  log(
    `DwollaUtils::duplicateExists:: Response from DwollaEvent database is ${JSON.stringify(
      webhook
    )}`
  );
  if (webhook?.dbId) {
    return true;
  } else {
    log(`DwollaUtils.ts::duplicateExists: No duplicate for Event ${id} found`);
    return false;
  }
}
