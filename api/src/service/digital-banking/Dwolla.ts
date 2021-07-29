import dotenv from "dotenv";
import * as dwolla from "dwolla-v2";
import {
  DwollaClientOptions,
  DwollaEvent,
  DwollaPersonalVerifiedCustomerRequest,
  DwollaUnverifiedCustomerRequest,
} from "./DwollaTypes";

const result = dotenv.config();
if (result.error) {
  throw result.error;
}

export async function getAppToken(): Promise<dwolla.Client> {
  const options: DwollaClientOptions = {
    key: process.env.DWOLLA_APP_KEY,
    secret: process.env.DWOLLA_APP_SECRET,
    environment: "sandbox",
  };
  return new dwolla.Client(options);
}

export async function createPersonalVerifiedCustomer(
  customer: DwollaPersonalVerifiedCustomerRequest
): Promise<string> {
  const appToken: dwolla.Client = await getAppToken();
  let customerURL: string;
  try {
    const res: dwolla.Response = await appToken.post("customers", customer);
    customerURL = res.headers.get("location");
    console.log(
      "Dwolla.createPersonalVerifiedCustomer(), entity created @ " + customerURL
    );
  } catch (e) {
    console.log("Dwolla.createPersonalVerifiedCustomer(), error " + e);
    throw e;
  }
  return customerURL;
}

export async function createUnverifiedCustomer(
  customer: DwollaUnverifiedCustomerRequest
): Promise<string> {
  const appToken: dwolla.Client = await getAppToken();
  let customerURL: string;
  try {
    const res: dwolla.Response = await appToken.post("customers", customer);
    customerURL = res.headers.get("location");
    console.log(
      "Dwolla.createUnverifiedCustomer(), entity created @ " + customerURL
    );
  } catch (e) {
    console.log("Dwolla.createUnverifiedCustomer(), error " + e);
    throw e;
  }
  return customerURL;
}

export async function consumeWebhook(
  eventToProcess: DwollaEvent
): Promise<boolean> {
  console.log("Dwolla.consumeWebhook() Processing Event:");
  console.log(JSON.stringify(eventToProcess, null, 2));
  console.log("Not implemented, returning false...");
  return false;
}
