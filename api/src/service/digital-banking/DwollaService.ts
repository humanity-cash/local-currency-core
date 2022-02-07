import * as dwolla from "dwolla-v2";
import {
  DwollaFundingSourceRequest,
  DwollaPersonalVerifiedCustomerRequest,
  DwollaTransferRequest,
  DwollaUnverifiedCustomerRequest,
} from "./DwollaTypes";
import { IDwollaNewUserResponse } from "../../types";
import { isDwollaProduction, log, httpUtils } from "src/utils";
import { getAppToken, getIdempotencyHeader } from "./DwollaUtils";

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

export function getFundingSourceLinkForOperator(
  operatorDisplayName: string
): string {
  let fundingSourceLink: string;

  if (operatorDisplayName == process.env.OPERATOR_1_DISPLAY_NAME)
    fundingSourceLink = process.env.OPERATOR_1_FUNDING_SOURCE;
  else fundingSourceLink = process.env.OPERATOR_2_FUNDING_SOURCE;

  return fundingSourceLink;
}

export async function getFundingSourceLinkForUser(
  userId: string
): Promise<string> {
  const fundingSource: dwolla.Response = await getFundingSourcesById(userId);

  // Error checking
  if (fundingSource.status !== httpUtils.codes.OK)
    throw `DwollaService.ts::getFundingSourceLinkForUser() Critical - could not retrieve funding sources for userId ${userId}`;

  if (fundingSource.body?._embedded["funding-sources"].length == 0)
    throw `DwollaService.ts::getFundingSourceLinkForUser() Critical - no funding sources for userId ${userId}`;

  // Funding sources is an array but only retrieve the first option
  const fundingSourceLink: string =
    fundingSource.body._embedded["funding-sources"][0]._links["self"].href;
  return fundingSourceLink;
}

export async function initiateMicroDepositsForUser(
  userId: string
): Promise<boolean> {
  if (isDwollaProduction())
    throw "DwollaService.ts::creatingFundingSource is not for production use, test only";

  const fundingSourceLink = await getFundingSourceLinkForUser(userId);
  const appToken: dwolla.Client = await getAppToken();
  await appToken.post(fundingSourceLink + "/micro-deposits", {
    headers: getIdempotencyHeader(),
  });
  await appToken.post(process.env.DWOLLA_BASE_URL + "sandbox-simulations", {
    headers: getIdempotencyHeader(),
  });
  return true;
}

export async function verifyMicroDepositsForUser(
  userId: string
): Promise<boolean> {
  if (isDwollaProduction())
    throw "DwollaService.ts::creatingFundingSource is not for production use, test only";

  const fundingSourceLink = await getFundingSourceLinkForUser(userId);
  const appToken: dwolla.Client = await getAppToken();
  const body = {
    amount1: {
      value: "0.03", //any random amount below 10c will confirm the micro deposit in sandbox
      currency: "USD",
    },
    amount2: {
      value: "0.09", //any random amount below 10c will confirm the micro deposit in sandbox
      currency: "USD",
    },
  };
  await appToken.post(fundingSourceLink + "/micro-deposits", body);
  return true;
}

export async function createFundingSource(
  fundingSource: DwollaFundingSourceRequest,
  userId: string
): Promise<dwolla.Response> {
  if (isDwollaProduction())
    throw "DwollaService.ts::creatingFundingSource is not for production use, test only";

  const appToken: dwolla.Client = await getAppToken();
  const fundingSources: dwolla.Response = await appToken.post(
    process.env.DWOLLA_BASE_URL + "customers/" + userId + "/funding-sources",
    fundingSource,
    getIdempotencyHeader()
  );
  return fundingSources;
}

export async function getIAVTokenById(id: string): Promise<string> {
  const appToken: dwolla.Client = await getAppToken();
  const iavToken: dwolla.Response = await appToken.post(
    process.env.DWOLLA_BASE_URL + "customers/" + id + "/iav-token",
    { headers: getIdempotencyHeader() }
  );
  return iavToken.body.token;
}

export async function createTransfer(
  transfer: DwollaTransferRequest
): Promise<dwolla.Response> {
  const appToken: dwolla.Client = await getAppToken();
  const res: dwolla.Response = await appToken.post(
    process.env.DWOLLA_BASE_URL + "transfers",
    transfer,
    getIdempotencyHeader()
  );
  const location = res.headers.get("location");
  log(`DwollaService.ts::createTransfer() Result ${location}`);
  return res;
}

export async function createPersonalVerifiedCustomer(
  customer: DwollaPersonalVerifiedCustomerRequest
): Promise<IDwollaNewUserResponse> {
  try {
    const appToken: dwolla.Client = await getAppToken();
    const res: dwolla.Response = await appToken.post(
      "customers",
      customer,
      getIdempotencyHeader()
    );
    const customerURL = res.headers.get("location");
    log(
      "DwollaService.ts::createPersonalVerifiedCustomer(), entity created @ " +
        customerURL
    );
    const result = await appToken.get(customerURL);
    const response: IDwollaNewUserResponse = {
      userId: result.body.id,
      resourceUri: customerURL,
    };
    return response;
  } catch (e) {
    log("DwollaService.ts::createPersonalVerifiedCustomer(), error " + e);
    throw e;
  }
}

export async function createUnverifiedCustomer(
  customer: DwollaUnverifiedCustomerRequest
): Promise<IDwollaNewUserResponse> {
  try {
    const appToken: dwolla.Client = await getAppToken();
    const res: dwolla.Response = await appToken.post(
      "customers",
      customer,
      getIdempotencyHeader()
    );
    const customerURL = res.headers.get("location");
    log(
      "DwollaService.ts::createUnverifiedCustomer(), entity created @ " +
        customerURL
    );
    const result = await appToken.get(customerURL);
    const response: IDwollaNewUserResponse = {
      userId: result.body.id,
      resourceUri: customerURL,
    };
    return response;
  } catch (e) {
    log("DwollaService.ts::createUnverifiedCustomer(), error " + e);
    throw e;
  }
}
