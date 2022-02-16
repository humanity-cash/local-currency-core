/* eslint-disable @typescript-eslint/no-explicit-any */
import BN from "bn.js";
import { Response } from "dwolla-v2";
import { DwollaTransferService } from "src/database/service";
import { getUserData } from "src/service/AuthService";
import {
  IDeposit,
  IDwollaNewUserInput,
  IDwollaNewUserResponse,
  IOperatorTotal,
  ITransferEvent,
  IWithdrawal,
} from "src/types";
import { getOperatorUserId, isDwollaProduction, log, userNotification } from "src/utils";
import * as web3Utils from "web3-utils";
import * as contracts from "./contracts";
import {
  createTransfer,
  createUnverifiedCustomer,
  getFundingSourceLinkForOperator,
  getFundingSourceLinkForUser,
} from "./digital-banking/DwollaService";
import {
  DwollaTransferRequest,
  DwollaUnverifiedCustomerRequest,
} from "./digital-banking/DwollaTypes";
import { getDwollaResourceFromLocation } from "./digital-banking/DwollaUtils";

// Do not convert to bytes32 here, it is done in the lower-level functions under ./contracts
export async function createUser(
  newUser: IDwollaNewUserInput
): Promise<IDwollaNewUserResponse> {
  const request: DwollaUnverifiedCustomerRequest = {
    firstName: newUser.firstName,
    lastName: newUser.lastName,
    email: newUser.email,
    businessName: newUser.rbn,
    ipAddress: newUser.ipAddress,
    correlationId: newUser.correlationId,
  };
  const response: IDwollaNewUserResponse = await createUnverifiedCustomer(
    request
  );
  log(`Created new customer in Dwolla: ${JSON.stringify(response)}`);
  return response;
}

const sortOperatorsFunc = (x: IOperatorTotal, y: IOperatorTotal) => {
  const a = new BN(x.currentOutstanding);
  const b = new BN(y.currentOutstanding);
  return a.eq(b) ? 0 : !a.lt(b) ? 1 : -1;
};

async function getSortedOperators(): Promise<IOperatorTotal[]> {
  const operatorStats: IOperatorTotal[] = await contracts.getFundingStatus();
  const sortedOperatorStats: IOperatorTotal[] =
    operatorStats.sort(sortOperatorsFunc);
  console.log(
    `deposit():: sorted operators are ${JSON.stringify(
      sortedOperatorStats,
      null,
      2
    )}`
  );
  return sortedOperatorStats;
}

async function createDwollaTransfer(
  fundingSourceLink: string,
  fundingTargetLink: string,
  amount: string,
  type: string,
  userId: string,
  operatorId: string,
  txId?:string
) {
  // 1 Construct transfer request
  const transferRequest: DwollaTransferRequest = {
    _links: {
      source: {
        href: fundingSourceLink,
      },
      destination: {
        href: fundingTargetLink,
      },
    },
    amount: {
      currency: "USD",
      value: amount,
    },
  };

  // 2 Initiate Dwolla transfer
  const transferResponse: Response = await createTransfer(transferRequest);
  log(
    `OperatorService.ts::createDwollaTransfer() ${transferResponse.headers.get(
      "location"
    )}`
  );

  // 3 Get newly created transfer
  const transferToUse: Response = await getDwollaResourceFromLocation(
    transferResponse.headers.get("location")
  );

  // 4 Save to DB
  const now = Date.now();
  const transfer: DwollaTransferService.ICreateDwollaTransferDBItem = {
    fundingTransferId: type == "DEPOSIT" ? transferToUse.body.id : undefined,
    fundingStatus: type == "DEPOSIT" ? transferToUse.body.status : undefined,
    fundedTransferId: type == "WITHDRAWAL" ? transferToUse.body.id : undefined,
    fundedStatus: type == "WITHDRAWAL" ? transferToUse.body.status : undefined,
    userId: userId,
    operatorId: operatorId,
    fundingSource: transferToUse.body._links["source-funding-source"].href,
    fundingTarget: transferToUse.body._links["destination-funding-source"].href,
    amount: transferToUse.body.amount.value,
    type: type,
    created: now,
    updated: now,
    txId: txId
  };
  const transferDBItem: DwollaTransferService.IDwollaTransferDBItem =
    await DwollaTransferService.create(transfer);
  return transferDBItem;
}

export async function deposit(
  userId: string,
  amount: string
): Promise<DwollaTransferService.IDwollaTransferDBItem> {
  const sortedOperatorStats = await getSortedOperators();
  const operatorToUse = sortedOperatorStats[0].operator;
  console.log(`OperatorService()::deposit() depositing to operator ${operatorToUse}`);

  const fundingSourceLink: string = await getFundingSourceLinkForUser(userId);
  console.log(
    `OperatorService()::deposit() funding source is user ${userId} with funding source ${fundingSourceLink}`
  );

  let fundingTargetLink: string;  
  if(isDwollaProduction()){
    fundingTargetLink = getFundingSourceLinkForOperator(sortedOperatorStats[0].operatorDisplayName);
  }
  else{
    const operatorUserId = await getOperatorUserId(operatorToUse);
    fundingTargetLink = await getFundingSourceLinkForUser(operatorUserId);
  }
  console.log(
    `OperatorService()::deposit() funding target is operator ${operatorToUse} (${sortedOperatorStats[0].operatorDisplayName}) with funding target ${fundingTargetLink}`
  );

  const transfer = await createDwollaTransfer(
    fundingSourceLink,
    fundingTargetLink,
    amount,
    "DEPOSIT",
    userId,
    operatorToUse
  );
  console.log(
    `OperatorService()::deposit() Dwolla transfer created and logged to database: ${JSON.stringify(
      transfer,
      null,
      2
    )}`
  );

  return transfer;
}

export async function webhookMint(fundingTransferId: string): Promise<boolean> {
  try {
    let transfer: DwollaTransferService.IDwollaTransferDBItem =
      await DwollaTransferService.getByFundingTransferId(fundingTransferId);
    const result = await contracts.deposit(
      transfer.userId,
      transfer.amount,
      transfer.operatorId
    );
    const updated = await DwollaTransferService.updateTxIdByFundingTransferId(fundingTransferId, result.transactionHash);
    transfer = await DwollaTransferService.getByFundingTransferId(fundingTransferId);
    console.log(`Updated transfer is ${JSON.stringify(transfer)}`);
    transfer = await DwollaTransferService.getByTxId(result.transactionHash);
    console.log(`[TEST] Retrieved transfer by txId is ${JSON.stringify(transfer)}`);
    return updated && result.status;
  } catch (err) {
    log(`OperatorService()::webhookMint() ${err}`);
    return false;
  }
}

export async function getDepositsForUser(userId: string): Promise<IDeposit[]> {
  const deposits = await contracts.getDepositsForUser(userId);
  return deposits;
}

export async function getWithdrawalsForUser(
  userId: string
): Promise<IWithdrawal[]> {
  const withdrawals = await contracts.getWithdrawalsForUser(userId);
  return withdrawals;
}

async function isCommunityChest(walletAddress: string) {
  const communityChestAddress = await contracts.communityChestAddress();
  return walletAddress == communityChestAddress;
}

async function isHumanityCash(walletAddress: string) {
  const humanityCashAddress = await contracts.humanityCashAddress();
  return walletAddress == humanityCashAddress;
}

async function getDisplayNameFromAddress(walletAddress: string) {
  if (await isCommunityChest(walletAddress)) return "Community Chest";
  else if (await isHumanityCash(walletAddress)) return "Humanity Cash";
  else {
    const userData = await getUserData(walletAddress);
    return userData?.data?.name;
  }
}

export async function getTransfersForUser(
  userId: string
): Promise<ITransferEvent[]> {
  // Need to manually get display names here to avoid API limits on calls
  const communityChestAddress = await contracts.communityChestAddress();
  const humanityCashAddress = await contracts.humanityCashAddress();

  const transfers = await contracts.getTransfersForUser(userId);
  return Promise.all(
    transfers.map(async function (t) {
      const fromName =
        t.fromAddress == communityChestAddress
          ? "Community Chest"
          : t.fromAddress == humanityCashAddress
          ? "Humanity Cash"
          : (await getUserData(t.fromAddress))?.data?.name;
      const toName =
        t.toAddress == communityChestAddress
          ? "Community Chest"
          : t.toAddress == humanityCashAddress
          ? "Humanity Cash"
          : (await getUserData(t.toAddress))?.data?.name;
      return {
        ...t,
        fromName: fromName,
        toName: toName,
      };
    })
  );
}

export async function withdraw(
  userId: string,
  amount: string
): Promise<boolean> {
  if (parseInt(amount) === 0) {
    throw Error("ERR_ZERO_VALUE");
  }
  if (parseFloat(amount) < 0) {
    throw Error("INVALID_ARGUMENT");
  }

  const sortedOperatorStats = await getSortedOperators();
  let amountToWithdraw = new BN(web3Utils.toWei(amount, "ether"));
  let index = sortedOperatorStats.length;

  // In the off chance that a single operator cannot
  // fulfill a large withdrawal, we need to iterate multiple
  // operators to serve the withdrawal

  while (amountToWithdraw.gtn(0)) {
    // Work backwards through the list of operators, sorted by currentOutstanding
    index--;

    const operator = sortedOperatorStats[index];
    const operatorOutstandingFunds = new BN(
      web3Utils.toWei(operator.currentOutstanding, "ether")
    );

    // If this operator has enough, then withdraw the full amount
    if (operatorOutstandingFunds.gte(amountToWithdraw)) {
      log(
        `OperatorService::withdraw():: withdrawing ${amountToWithdraw.toString()} entire withdrawal from operator ${
          operator.operator
        } (${
          operator.operatorDisplayName
        }) who has ${operatorOutstandingFunds.toString()} in outstanding funds`
      );

      // Blockchain withdrawal first
      const transaction = await contracts.withdraw(
        userId,
        web3Utils.fromWei(amountToWithdraw.toString()),
        operator.operator
      );
      const txId = transaction.transactionHash;

      // Then Dwolla withdrawal
      let fundingSourceLink: string;  
      if(isDwollaProduction()){
        fundingSourceLink = getFundingSourceLinkForOperator(operator.operatorDisplayName);
      }
      else{
        const operatorUserId = await getOperatorUserId(operator.operator);
        fundingSourceLink = await getFundingSourceLinkForUser(operatorUserId);
      }
      console.log(
        `OperatorService()::deposit() funding target is operator ${operator.operator} (${sortedOperatorStats[0].operatorDisplayName}) with funding source ${fundingSourceLink}`
      );    

      const fundingTargetLink: string = await getFundingSourceLinkForUser(
        userId
      );
      await createDwollaTransfer(
        fundingSourceLink,
        fundingTargetLink,
        web3Utils.fromWei(amountToWithdraw.toString()),
        "WITHDRAWAL",
        userId,
        operator.operator,
        txId
      );

      // Clear amountToWithdraw, we have satisfied the user's full redemption amount
      amountToWithdraw = new BN(0);
    }

    // Otherwise only withdraw the total this operator has
    else {
      log(
        `withdraw():: withdrawing partial amount ${operatorOutstandingFunds.toString()} from operator ${
          operator.operator
        } (${
          operator.operator
        }) who has only ${operatorOutstandingFunds.toString()} in outstanding funds`
      );

      // Blockchain withdrawal first
      const transaction = await contracts.withdraw(
        userId,
        web3Utils.fromWei(operatorOutstandingFunds.toString()),
        operator.operator
      );
      const txId = transaction.transactionHash;

      // Then Dwolla withdrawal
      let fundingSourceLink: string;  
      if(isDwollaProduction()){
        fundingSourceLink = getFundingSourceLinkForOperator(operator.operatorDisplayName);
      }
      else{
        const operatorUserId = await getOperatorUserId(operator.operator);
        fundingSourceLink = await getFundingSourceLinkForUser(operatorUserId);
      }
      console.log(
        `OperatorService()::deposit() funding target is operator ${operator.operator} (${sortedOperatorStats[0].operatorDisplayName}) with funding source ${fundingSourceLink}`
      );  
      const fundingTargetLink: string = await getFundingSourceLinkForUser(
        userId
      );
      await createDwollaTransfer(
        fundingSourceLink,
        fundingTargetLink,
        web3Utils.fromWei(operatorOutstandingFunds.toString()),
        "WITHDRAWAL",
        userId,
        operator.operator,
        txId
      );

      // Reduce the amount remaining to withdraw and iterate to the next operator
      amountToWithdraw = amountToWithdraw.sub(operatorOutstandingFunds);

      if (index >= sortedOperatorStats?.length)
        throw Error(
          `withdraw():: Critical - cannot fulfill withdrawal ${amount} for userId ${userId}`
        );
    }
  }

  return amountToWithdraw.eqn(0);
}

export async function transferTo(
  fromUserId: string,
  toUserId: string,
  amount: string,
  roundUpAmount = "0"
): Promise<boolean> {
  const success: boolean = (
    await contracts.transferTo(fromUserId, toUserId, amount, roundUpAmount)
  ).status;

  if (success) {
    const addressPromises = [
      contracts.getWalletAddress(fromUserId),
      contracts.getWalletAddress(toUserId),
    ];
    const addresses = await Promise.all(addressPromises);

    const fromName = await getDisplayNameFromAddress(addresses[0]);
    const toName = await getDisplayNameFromAddress(addresses[1]);

    log(
      `OperatorService::transferTo() Transfer from ${addresses[0]} (${fromName}) to ${addresses[1]} (${toName})`
    );

    await userNotification(
      fromUserId,
      `You've successfully sent B$${amount} to ${toName}`,
      "INFO"
    );
    await userNotification(
      toUserId,
      `You've received B$${amount} from ${fromName}`,
      "INFO"
    );
  }

  return success;
}
