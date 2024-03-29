import * as dwolla from "dwolla-v2";
import {
  DwollaFundingSourceRequest,
  DwollaPersonalVerifiedCustomerRequest,
  DwollaTransferRequest,
  DwollaUnverifiedCustomerRequest,
} from "./DwollaTypes";
import { IDwollaNewUserResponse, IDBUser } from "../../types";
import {
  isDwollaProduction,
  log,
  httpUtils,
  userNotification,
} from "src/utils";
import {
  getAppToken,
  getDwollaResourceFromLocation,
  getIdempotencyHeader,
} from "./DwollaUtils";
import {
  DwollaTransferService,
  LaunchPromotionService,
  UserService,
} from "src/database/service";
import { getWallet } from "../PublicService";
import { webhookMint } from "../OperatorService";
import { transferLaunchPoolBonus } from "../contracts";

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
    process.env.DWOLLA_BASE_URL +
      "customers/" +
      id +
      "/funding-sources?removed=false"
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

export async function initiateMicroDepositsForTestUser(
  userId: string
): Promise<boolean> {
  if (isDwollaProduction())
    throw "DwollaService.ts::initiateMicroDepositsForUser is not for production use, test only";

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

export async function verifyMicroDepositsForTestUser(
  userId: string
): Promise<boolean> {
  if (isDwollaProduction())
    throw "DwollaService.ts::verifyMicroDepositsForTestUser is not for production use, test only";

  return verifyMicroDepositsForUser(userId, ".01", ".02");
}

export async function verifyMicroDepositsForUser(
  userId: string,
  amount1: string,
  amount2: string
): Promise<boolean> {
  const fundingSourceLink = await getFundingSourceLinkForUser(userId);
  const appToken: dwolla.Client = await getAppToken();
  const body = {
    amount1: {
      value: amount1,
      currency: "USD",
    },
    amount2: {
      value: amount2,
      currency: "USD",
    },
  };
  await appToken.post(
    fundingSourceLink + "/micro-deposits",
    body,
    getIdempotencyHeader()
  );
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

export async function processLaunchPromotionForUser(
  dwollaUserId: string,
  fingerprint: string
): Promise<boolean> {
  log(
    `Funding source verified for user ${dwollaUserId}, with fingerprint ${fingerprint}`
  );
  const launchPromotionRecord = await LaunchPromotionService.findByFingerprint(
    fingerprint
  );
  let success = false;

  if (!launchPromotionRecord) {
    log(
      `Funding source with fingerprint ${fingerprint} has not had promotional value applied`
    );
    const promotionsApplied = await LaunchPromotionService.getCount();
    log(`Number of promotions applied so far is ${promotionsApplied}`);

    if (promotionsApplied < 5000) {
      log(
        `Applying promotional bonus of B$10 to user ${dwollaUserId} with funding source fingerprint ${fingerprint}`
      );
      const launchPoolBonusTransferred = await transferLaunchPoolBonus(
        dwollaUserId
      );
      if (launchPoolBonusTransferred) {
        await LaunchPromotionService.create({
          fingerprint: fingerprint,
          promotionAmount: "10.0",
        });
        await userNotification(
          dwollaUserId,
          "Thank you for linking your bank account! You've received a promotional deposit of B$10"
        );
        success = true;
      } else {
        log(
          `Warning: Promotional bonus was not transferred, was there a blockchain error?`
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
  return success;
}

export async function reconcileLinkedFundingSourceBonus(): Promise<boolean> {
  const users: IDBUser[] = await UserService.getAll();
  log(
    `reconcileLinkedFundingSourceBonus() Total number of users is ${users?.length}`
  );

  for (let i = 0; i < users?.length; i++) {
    try {
      const user = users[i];

      // Check funding sources for users
      if (user?.verifiedCustomer && user?.customer?.dwollaId) {
        const fundingSources: dwolla.Response = await getFundingSourcesById(
          user.customer.dwollaId
        );
        log(
          `reconcileLinkedFundingSourceBonus() User ${user.email} (${user.customer.dwollaId}) is a verified customer with ${fundingSources?.body?._embedded["funding-sources"]?.length} funding sources...`
        );
        let promotionCount = 0;

        for (
          let j = 0;
          j < fundingSources?.body?._embedded["funding-sources"]?.length;
          j++
        ) {
          const fundingSource =
            fundingSources.body._embedded["funding-sources"][j];
          const fingerprint = fundingSource.fingerprint;
          if (promotionCount == 0) {
            if (fundingSource.status == "verified") {
              const launchBonusApplied = await processLaunchPromotionForUser(
                user.customer.dwollaId,
                fingerprint
              );
              if (launchBonusApplied) promotionCount++;
            } else {
              log(
                `reconcileLinkedFundingSourceBonus() Funding source with fingerprint ${fingerprint} is in status ${fundingSource.status} and is not yet valid to receive promotion`
              );
            }
          } else {
            log(
              `reconcileLinkedFundingSourceBonus() We've already applied a new promotion for this user in this reconciliation batch, they should not have another applied`
            );
          }
        }
      }

      // Check funding sources for businesses
      if (user?.verifiedBusiness && user?.business?.dwollaId) {
        const fundingSources: dwolla.Response = await getFundingSourcesById(
          user.business.dwollaId
        );
        log(
          `reconcileLinkedFundingSourceBonus() User ${user.email} (${user.business.dwollaId}) is a verified business with ${fundingSources?.body?._embedded["funding-sources"]?.length} funding sources...`
        );
        let promotionCount = 0;

        for (
          let j = 0;
          j < fundingSources?.body?._embedded["funding-sources"]?.length;
          j++
        ) {
          const fundingSource =
            fundingSources.body._embedded["funding-sources"][j];
          const fingerprint = fundingSource.fingerprint;
          if (promotionCount == 0) {
            if (fundingSource.status == "verified") {
              const launchBonusApplied = await processLaunchPromotionForUser(
                user.business.dwollaId,
                fingerprint
              );
              if (launchBonusApplied) promotionCount++;
            } else {
              log(
                `reconcileLinkedFundingSourceBonus() Funding source with fingerprint ${fingerprint} is in status ${fundingSource.status} and is yet valid to receive promotion`
              );
            }
          } else {
            log(
              `reconcileLinkedFundingSourceBonus() We've already applied a new promotion for this user in this reconciliation batch, they should not have another applied`
            );
          }
        }
      }
    } catch (err) {
      log(
        `reconcileLinkedFundingSourceBonus() Critical error ${err} during linked funding source bonus reconciliation...`
      );
      return false;
    }
  }
  return true;
}

export async function reconcileDwollaDeposits(): Promise<boolean> {
  try {
    const deposits: DwollaTransferService.IDwollaTransferDBItem[] =
      await DwollaTransferService.getAll("DEPOSIT");

    log(
      `reconcileDwollaDeposits() Total number of deposits is ${deposits?.length}`
    );

    for (let i = 0; i < deposits?.length; i++) {
      try {
        let deposit = deposits[i];
        const createdDate = new Date(deposit.created).toLocaleDateString();
        const updatedDate = new Date(deposit.updated).toLocaleDateString();
        const user = await getWallet(deposit.userId);

        log(
          `**************************************************************************************************************`
        );
        log(
          `reconcileDwollaDeposits() Reconciling deposit for userId ${deposit.userId} (${user.customer?.body?.firstName} ${user.customer?.body?.lastName} ${user.customer?.body?.email}) for ${deposit.amount}, created ${createdDate}, updated ${updatedDate}`
        );
        log(
          `reconcileDwollaDeposits() Database status - fundingTransferId: ${deposit.fundingTransferId} fundingTransferStatus: ${deposit.fundingStatus}`
        );
        log(
          `reconcileDwollaDeposits() Database status - fundedTransferId: ${deposit.fundedTransferId} fundedTransferStatus: ${deposit.fundedStatus}`
        );
        log(`txId: ${deposit.txId}`);

        const fundingStatusCompleteLocal =
          deposit.fundingStatus?.includes("completed");
        const fundedStatusCompleteLocal =
          deposit.fundedStatus?.includes("completed");

        let dwollaFundingTransfer: dwolla.Response;
        if (deposit.fundingTransferId)
          dwollaFundingTransfer = await getDwollaResourceFromLocation(
            `${process.env.DWOLLA_BASE_URL}transfers/${deposit.fundingTransferId}`
          );

        let dwollaFundedTransfer: dwolla.Response;
        if (deposit.fundedTransferId)
          dwollaFundedTransfer = await getDwollaResourceFromLocation(
            `${process.env.DWOLLA_BASE_URL}transfers/${deposit.fundedTransferId}`
          );
        else {
          const fundedTransferLink =
            dwollaFundingTransfer?.body?._links["funded-transfer"]?.href;
          if (fundedTransferLink) {
            log(
              `reconcileDwollaDeposits() Deposit is in an unstable state, no fundedTransferId exists on the database object, but it does on the funding Dwolla object`
            );
            log(
              `reconcileDwollaDeposits() Let's update the fundedTransferId and then retrieve the Dwolla object again...`
            );
            dwollaFundedTransfer = await getDwollaResourceFromLocation(
              fundedTransferLink
            );
            if (dwollaFundedTransfer) {
              deposit = await DwollaTransferService.setFundedTransferId(
                deposit.fundingTransferId,
                dwollaFundedTransfer?.body?.id
              );
              log(
                `reconcileDwollaDeposits() Updated fundedTransferId on database object to ${dwollaFundedTransfer?.body?.id}`
              );
              log(
                `reconcileDwollaDeposits() Database status - fundedTransferId: ${deposit.fundedTransferId} fundedTransferStatus: ${deposit.fundedStatus}`
              );
            } else {
              log(
                `reconcileDwollaDeposits() Error! Could not find a funded transfer on Dwolla for location ${fundedTransferLink}`
              );
            }
          } else
            log(
              `reconcileDwollaDeposits() There is no funded transfer referenced both in the database or in the Dwolla object, this transfer is still in progress...`
            );
        }

        const fundingStatusCompleteDwolla =
          dwollaFundingTransfer?.body?.status?.includes("processed");
        const fundedStatusCompleteDwolla =
          dwollaFundedTransfer?.body?.status?.includes("processed");

        log(
          `reconcileDwollaDeposits() Dwolla status - fundingTransferId: ${deposit.fundingTransferId} fundingTransferStatus: ${dwollaFundingTransfer?.body?.status}`
        );
        log(
          `reconcileDwollaDeposits() Dwolla status - fundedTransferId: ${deposit.fundedTransferId} fundedTransferStatus: ${dwollaFundedTransfer?.body?.status}`
        );

        let shouldMint = false;

        if (fundingStatusCompleteDwolla && fundedStatusCompleteDwolla) {
          log(
            `reconcileDwollaDeposits() This deposit is fully processed by Dwolla...`
          );

          if (fundedStatusCompleteLocal && fundingStatusCompleteLocal) {
            log(
              `reconcileDwollaDeposits() This deposit is fully processed by us...`
            );

            if (deposit.txId) {
              log(
                `reconcileDwollaDeposits() This deposit appears to have been processed on-chain and minted, deposit is fully reconciled! No further action required.`
              );
            } else {
              log(
                `reconcileDwollaDeposits() This deposit appears to have been fully completed both on Dwolla and in our database, but not minted. Proceed with minting.`
              );
              shouldMint = true;
            }
          } else {
            log(
              `reconcileDwollaDeposits() This deposit appears fully processed by Dwolla but this is not reflected in our database, perhaps we missed a webhook?`
            );

            if (deposit.fundingTransferId && deposit.fundedTransferId) {
              await DwollaTransferService.updateStatusByFundingTransferId(
                deposit.fundingTransferId,
                "transfer_completed"
              );
              log(
                `reconcileDwollaDeposits() Updated fundingStatus to "transfer_completed"`
              );
              await DwollaTransferService.updateStatusByFundedTransferId(
                deposit.fundedTransferId,
                "bank_transfer_completed"
              );
              log(
                `reconcileDwollaDeposits() Updated fundedStatus to "bank_transfer_completed"`
              );
              shouldMint = true;
            } else {
              throw `fundingTransferId and fundedTransferId are not both set in the database so we cannot update both statuses`;
            }
          }
        } else {
          log(
            `reconcileDwollaDeposits() This deposit is not fully processed by Dwolla, continue waiting...`
          );
        }

        if (shouldMint) {
          const success = await webhookMint(deposit.fundingTransferId);
          if (success) {
            const transfer: DwollaTransferService.IDwollaTransferDBItem =
              await DwollaTransferService.getByFundingTransferId(
                deposit.fundingTransferId
              );
            log(
              `reconcileDwollaDeposits() Successfully minted on-chain for deposit with fundingTransferId ${deposit.fundingTransferId} for user ${deposit.userId}, txId: ${transfer.txId}`
            );
            await userNotification(
              deposit.userId,
              `Your deposit of $${deposit.amount} created on ${new Date(
                deposit.created
              ).toLocaleDateString()} has completed!`
            );
          } else throw `Could not mint! webhookMint returned false!`;
        }
      } catch (err) {
        log(`reconcileDwollaDeposits() Error processing this deposit: ${err}`);
        log(
          `reconcileDwollaDeposits() Skipping this deposit and moving to the next one. Requires manual investigation.`
        );
      }
    }
    return true;
  } catch (err) {
    log(
      `reconcileDwollaDeposits() Critical error ${err} during deposit reconciliation...`
    );
    return false;
  }
}
