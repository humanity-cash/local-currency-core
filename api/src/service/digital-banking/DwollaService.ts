import * as dwolla from "dwolla-v2";
import {
  DwollaClientOptions,
  DwollaEvent,
  DwollaPersonalVerifiedCustomerRequest,
  DwollaUnverifiedCustomerRequest,
} from "./DwollaTypes";
import { newWallet } from "../contracts";
import { INewUserResponse } from "../../types";
import { log } from "src/utils";
import { duplicateExists } from "./DwollaUtils";
import { DwollaEventService } from "src/database/service";

export async function getAppToken(): Promise<dwolla.Client> {
  const options: DwollaClientOptions = {
    key: process.env.DWOLLA_APP_KEY,
    secret: process.env.DWOLLA_APP_SECRET,
    environment: "sandbox",
  };
  return new dwolla.Client(options);
}

export async function registerWebhook() : Promise<string>{
  const appToken: dwolla.Client = await getAppToken();
  const webhook = {
    url: process.env.WEBHOOK_URL,
    secret: process.env.WEBHOOK_SECRET
  }
  const response: dwolla.Response = await appToken.post(
    process.env.DWOLLA_BASE_URL + "webhook-subscriptions/", webhook
  );
  const webhookUrl = response.headers.get("location");
  log(`Webhook ${webhook.url} successfully registered, location ${webhookUrl}`);
  return webhookUrl;
}

export async function getDwollaCustomerById(
  id: string
): Promise<dwolla.Response> {
  const appToken: dwolla.Client = await getAppToken();
  const customer: dwolla.Response = await appToken.get(
    process.env.DWOLLA_BASE_URL + "customers/" + id
  );
  return customer;
}

export async function getFundingSourcesById(
  id: string
): Promise<dwolla.Response> {
  const appToken: dwolla.Client = await getAppToken();
  const fundingSources: dwolla.Response = await appToken.get(
    process.env.DWOLLA_BASE_URL + "customers/" + id + "/funding-sources"
  );
  return fundingSources;
}

export async function getIAVTokenById(id: string): Promise<string> {
  const appToken: dwolla.Client = await getAppToken();
  const iavToken: dwolla.Response = await appToken.post(
    process.env.DWOLLA_BASE_URL + "customers/" + id + "/iav-token"
  );
  return iavToken.body.token;
}

export async function createPersonalVerifiedCustomer(
  customer: DwollaPersonalVerifiedCustomerRequest
): Promise<INewUserResponse> {
  try {
    const appToken: dwolla.Client = await getAppToken();
    const res: dwolla.Response = await appToken.post("customers", customer);
    const customerURL = res.headers.get("location");
    log(
      "Dwolla.createPersonalVerifiedCustomer(), entity created @ " + customerURL
    );
    const result = await appToken.get(customerURL);
    const response: INewUserResponse = {
      userId: result.body.id,
      resourceUri: customerURL,
    };
    return response;
  } catch (e) {
    log("Dwolla.createPersonalVerifiedCustomer(), error " + e);
    throw e;
  }
}

export async function createUnverifiedCustomer(
  customer: DwollaUnverifiedCustomerRequest
): Promise<INewUserResponse> {
  try {
    const appToken: dwolla.Client = await getAppToken();
    const res: dwolla.Response = await appToken.post("customers", customer);
    const customerURL = res.headers.get("location");
    log("Dwolla.createUnverifiedCustomer(), entity created @ " + customerURL);
    const result = await appToken.get(customerURL);
    const response: INewUserResponse = {
      userId: result.body.id,
      resourceUri: customerURL,
    };
    return response;
  } catch (e) {
    log("Dwolla.createUnverifiedCustomer(), error " + e);
    throw e;
  }
}

function logUnsupported(topic: string) {
  log(
    `Dwolla.consumeWebhook() Unsupported ${topic} received, nothing to do...`
  );
}

function logSupported(topic: string) {
  log(
    `Dwolla.consumeWebhook() Supported topic ${topic} received and beginning processing...`
  );
}

export async function consumeWebhook(
  eventToProcess: DwollaEvent
): Promise<boolean> {
  log("Dwolla.consumeWebhook() Processing Event:");
  log(JSON.stringify(eventToProcess, null, 2));

  let processed = false;
  const duplicate : boolean = await duplicateExists(eventToProcess.id);
  if(!duplicate){
    switch (eventToProcess.topic) {
      case "customer_created":
        try {
          logSupported(eventToProcess.topic);
          const appToken: dwolla.Client = await getAppToken();
          const res = await appToken.get(eventToProcess._links.resource.href);
          const customer = res.body;
          const address = await newWallet(customer.id);
          log(
            `Dwolla.consumeWebhook() Successfully created new wallet on-chain for userId ${customer.id}, email ${customer.email}, with address ${address}`
          );
          processed = true;
        } catch (err) {
          log(
            `Dwolla.consumeWebhook() error during 'customer_created' topic processing ${err}`
          );
          throw err;
        }
        break;
  
      case "customer_suspended":
        logUnsupported(eventToProcess.topic);
        break;
  
      case "customer_activated":
        logUnsupported(eventToProcess.topic);
        break;
  
      case "customer_deactivated":
        logUnsupported(eventToProcess.topic);
        break;
  
      case "customer_funding_source_added":
        logUnsupported(eventToProcess.topic);
        break;
  
      case "customer_funding_source_removed":
        logUnsupported(eventToProcess.topic);
        break;
  
      case "customer_funding_source_unverified":
        logUnsupported(eventToProcess.topic);
        break;
  
      case "customer_funding_source_negative":
        logUnsupported(eventToProcess.topic);
        break;
  
      case "customer_funding_source_updated":
        logUnsupported(eventToProcess.topic);
        break;
  
      case "customer_bank_transfer_created	":
        logUnsupported(eventToProcess.topic);
        break;
  
      case "customer_bank_transfer_cancelled":
        logUnsupported(eventToProcess.topic);
        break;
  
      case "customer_bank_transfer_failed":
        logUnsupported(eventToProcess.topic);
        break;
  
      case "customer_bank_transfer_creation_failed":
        logUnsupported(eventToProcess.topic);
        break;
  
      case "customer_bank_transfer_completed":
        logUnsupported(eventToProcess.topic);
        break;
  
      case "customer_transfer_created":
        logUnsupported(eventToProcess.topic);
        break;
  
      case "customer_transfer_cancelled":
        logUnsupported(eventToProcess.topic);
        break;
  
      case "customer_transfer_failed":
        logUnsupported(eventToProcess.topic);
        break;
  
      case "customer_transfer_completed":
        logUnsupported(eventToProcess.topic);
        break;
  
      default:
        throw `Unknown topic ${eventToProcess.topic}, don't know how to process...`;
    }
  }

  if(processed){
    const result = await DwollaEventService.create({
      eventId: eventToProcess.id,
      resourceId: eventToProcess.resourceId,
      topic: eventToProcess.topic,
      created: eventToProcess.created
    });
    log("DwollaService.consumeWebhook() Dwolla Event written to database, dbId " + result.dbId);
  }  

  return processed;
}