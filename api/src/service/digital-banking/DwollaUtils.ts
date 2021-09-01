import crypto from "crypto";
import { Buffer } from "buffer";
import { log } from "src/utils";

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
// Check for duplicate events in a queue or database
export function duplicateExists(id: string): boolean {
  // ToDo - check queue or database for a DwollaEvent with the same id attribute can be ignored
  log(`DwollaUtils.ts::duplicateExists: No duplicate for Event ${id}`);
  return false;
}
