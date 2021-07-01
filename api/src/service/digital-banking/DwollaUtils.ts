import crypto from "crypto";
import { Buffer } from "buffer";

export function validSignature(
  proposedSignature: string,
  webhookSecret: string,
  payloadBody: string
): boolean {
  let verified = false;
  try {
    const hash = crypto
      .createHmac("sha256", webhookSecret)
      .update(payloadBody)
      .digest("hex");

    verified = crypto.timingSafeEqual(
      Buffer.from(proposedSignature),
      Buffer.from(hash)
    );
    console.log(
      `DwollaUtils.ts::verifyGatewaySignature: event with signature ${proposedSignature} is valid`
    );
  } catch (e) {
    console.log(`DwollaUtils.ts::verifyGatewaySignature: ${e}`);
  }
  return verified;
}

// Webhook events can be fired multiple times by Dwolla
// Check for duplicate events in a queue or database
export function duplicateExists(id: string): boolean {
  // ToDo - check queue or database for a DwollaEvent with the same id attribute can be ignored
  console.log(`DwollaUtils.ts::duplicateExists: No duplicate for Event ${id}`);
  return false;
}
