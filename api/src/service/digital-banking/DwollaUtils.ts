import crypto from "crypto";
import { Buffer } from "buffer";
import { isDwollaProduction, log } from "src/utils";
import { DwollaClientOptions, DwollaEvent, DwollaToken } from "./DwollaTypes";
import * as dwolla from "dwolla-v2";
import { DwollaEventService } from "src/database/service";
import { v4 } from "uuid";

let appTokenRefreshed = 0;
let appToken: dwolla.Client;

export async function getClientToken(
  options: DwollaClientOptions = {
    key: process.env.DWOLLA_APP_KEY,
    secret: process.env.DWOLLA_APP_SECRET,
    environment: "sandbox",
  }
): Promise<dwolla.Client> {
  try {
    const appToken = new dwolla.Client(options);
    //log(`DwollaUtils::getClientToken() App token is ${JSON.stringify(appToken, null,2)}`);

    const clients: dwolla.Response = await appToken.get(`clients`);
    const client = clients?.body["_embedded"]?.clients[0];
    // log(`DwollaUtils::getClientToken() Client is ${JSON.stringify(client, null, 2)}`);
    // log(`DwollaUtils::getClientToken() Client ID ${client.id}`);

    const res: dwolla.Response = await appToken.post(
      `/clients/${client.id}/tokens`
    );
    const token: DwollaToken = {
      access_token: res?.body?.access_token,
      token_type: res?.body?.token_type,
      expires_in: res?.body?.expires_in,
    };
    // log(`DwollaUtils::getClientToken() Client token is ${JSON.stringify(token, null, 2)}`);

    const clientToken = await appToken.token(token);
    return clientToken;
  } catch (err) {
    log(`DwollaUtils::getClientToken() Cannot create client token: ${err}`);
    throw err;
  }
}

export async function getAppToken(): Promise<dwolla.Client> {
  if (isDwollaProduction()) {
    log(`DwollaUtils.ts::getAppToken() Retrieving client token...`);
    return getClientToken({
      key: process.env.DWOLLA_APP_KEY,
      secret: process.env.DWOLLA_APP_SECRET,
      environment: "production",
    });
  } else {
    const msSinceRefreshed = Date.now() - appTokenRefreshed;
    const msInTenMinutes = 10 * 60 * 1000;

    if (msSinceRefreshed > msInTenMinutes) {
      const options: DwollaClientOptions = {
        key: process.env.DWOLLA_APP_KEY,
        secret: process.env.DWOLLA_APP_SECRET,
        environment: "sandbox",
      };
      appToken = new dwolla.Client(options);
      appTokenRefreshed = Date.now();
      log(`DwollaUtils.ts::getAppToken() appToken refreshed`);
    }
    return appToken;
  }
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
      `DwollaUtils.ts::verifyGatewaySignature() Attempting to validate payloadBody ${JSON.stringify(
        payloadBody,
        null,
        2
      )}...`
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
      `DwollaUtils.ts::verifyGatewaySignature() event with signature ${proposedSignature} is ${
        verified ? "valid" : "not valid"
      }`
    );
    return verified;
  } catch (e) {
    log(`DwollaUtils.ts::verifyGatewaySignature() ${e}`);
  }
}

export function getIdempotencyHeader(): { "Idempotency-Key"?: string } {
  return { "Idempotency-Key": v4() };
}

// Webhook events can be fired multiple times by Dwolla
// Check for duplicate events in database
export async function duplicateWebhookExists(id: string): Promise<boolean> {
  const webhook = await DwollaEventService.findByObject(id);
  log(
    `DwollaUtils.ts::duplicateExists() Response from DwollaEvent database is ${JSON.stringify(
      webhook
    )}`
  );
  if (webhook?.dbId) {
    return true;
  } else {
    log(`DwollaUtils.ts::duplicateExists() No duplicate for Event ${id} found`);
    return false;
  }
}

export async function getDwollaCustomerFromEvent(
  event: DwollaEvent
): Promise<dwolla.Response> {
  const appToken: dwolla.Client = await getAppToken();
  const res = await appToken.get(event._links.customer.href);
  log(
    `DwollaUtils.ts::getDwollaCustomerFromEvent() Event refers to customer ${JSON.stringify(
      res.body,
      null,
      2
    )}`
  );
  return res;
}

export async function getDwollaResourceFromEvent(
  event: DwollaEvent
): Promise<dwolla.Response> {
  const appToken: dwolla.Client = await getAppToken();
  const res = await appToken.get(event._links.resource.href);
  log(
    `DwollaUtils.ts::getDwollaResourceFromEvent() Event refers to resource ${JSON.stringify(
      res.body,
      null,
      2
    )}`
  );
  return res;
}

export async function getDwollaResourceFromLocation(
  location: string
): Promise<dwolla.Response> {
  const appToken: dwolla.Client = await getAppToken();
  const res = await appToken.get(location);
  log(
    `DwollaUtils.ts::getDwollaResourceFromLocation() Location refers to resource ${JSON.stringify(
      res.body,
      null,
      2
    )}`
  );
  return res;
}
