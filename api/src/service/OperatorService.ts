/* eslint-disable @typescript-eslint/no-explicit-any */
import BN from "bn.js";
import { Response } from "dwolla-v2";
import { DwollaTransferService } from "src/database/service";
import {
  IDeposit, IDowllaNewUser, INewUserResponse, IOperatorTotal, ITransferEvent,
  IWithdrawal
} from "src/types";
import { httpUtils, log, sleep } from "src/utils";
import * as web3Utils from "web3-utils";
import * as contracts from "./contracts";
import {
  createTransfer, createUnverifiedCustomer, getFundingSourceLinkForUser,
  getTransferCollectionForUser
} from "./digital-banking/DwollaService";
import {
  DwollaTransferRequest, DwollaUnverifiedCustomerRequest
} from "./digital-banking/DwollaTypes";

// Do not convert to bytes32 here, it is done in the lower-level functions under ./contracts
export async function createUser(newUser: IDowllaNewUser): Promise<INewUserResponse> {
  const request: DwollaUnverifiedCustomerRequest = {
    firstName: newUser.firstName,
    lastName: newUser.lastName,
    email: newUser.email,
    businessName: newUser.rbn,
    ipAddress: newUser.ipAddress,
    correlationId: newUser.authUserId,
  };
  const response: INewUserResponse = await createUnverifiedCustomer(request);
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
  log(
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
  retryCount?:number
) {

  let retryReponse : DwollaTransferService.IDwollaTransferDBItem;
  const retryTimeoutMs = 1000;
  const maxRetries = 5;
  log(`OperatorServices.ts::createDwollaTransfer Retry count is ${retryCount ? retryCount : 0}`);

  if(!retryCount){
    // Construct transfer request
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

    // Inititate Dwolla transfer
    const transferResponse: Response = await createTransfer(transferRequest);
    log(
      `OperatorService.ts::createDwollaTransfer() ${JSON.stringify(
        transferResponse,
        null,
        2
      )}`
    );

    // Error checking
    if (
      !(
        transferResponse.status == httpUtils.codes.CREATED ||
        transferResponse.status == httpUtils.codes.OK
      )
    ){ 
      const error = `OperatorService.ts::createDwollaTransfer() Failed creating Dwolla deposit request (status ${transferResponse.status}) for userId ${userId}, see logs for details`;
      console.log(error);
      if(!retryCount || retryCount < maxRetries){
        console.log(`OperatorService.ts::createDwollaTransfer() Waiting 3000ms before retrieving transfers from Dwolla and retrying this method. Retry count is ${retryCount ? retryCount : 0}`);
        await sleep(retryTimeoutMs);
        retryReponse = await createDwollaTransfer(fundingSourceLink, fundingTargetLink, amount, type, userId, operatorId, retryCount ? (retryCount+1): 1);
      }
      else
        throw error;
    }
  }

  // Retrieve transfers for user
  const transfers: Response = await getTransferCollectionForUser(userId);

  // Error checking
  if (transfers?.body?._embedded?.transfers?.length == 0){ 
    const error = `OperatorService.ts::createDwollaTransfer() No transfers exist for userId ${userId}, see logs for details`;
    console.log(error);
    if(!retryCount || retryCount < maxRetries){
      console.log(`OperatorService.ts::createDwollaTransfer() Waiting 3000ms before retrieving transfers from Dwolla and retrying this method. Retry count is ${retryCount ? retryCount : 0}`);
      await sleep(retryTimeoutMs);
      retryReponse = await createDwollaTransfer(fundingSourceLink, fundingTargetLink, amount, type, userId, operatorId, retryCount ? (retryCount+1): 1);
    }
    else
      throw error;
  }

  if (transfers.status != httpUtils.codes.OK){ 
    const error =`OperatorService.ts::createDwollaTransfer() Failed creating Dwolla deposit request for userId ${userId}, see logs for details`;
    console.log(error);
    if(!retryCount || retryCount < maxRetries){
      console.log(`OperatorService.ts::createDwollaTransfer() Waiting 3000ms before retrieving transfers from Dwolla and retrying this method. Retry count is ${retryCount ? retryCount : 0}`);
      await sleep(retryTimeoutMs);
      retryReponse = await createDwollaTransfer(fundingSourceLink, fundingTargetLink, amount, type, userId, operatorId, retryCount ? (retryCount+1): 1);
    }
    else
      throw error;
  }

  log(
    `OperatorService.ts::createDwollaTransfer() Transfers for user ${userId} are ${JSON.stringify(
      transfers,
      null,
      2
    )}`
  );

  // Sort transfers by date
  const sortedTransfers = transfers?.body?._embedded?.transfers?.sort(function (
    a,
    b
  ) {
    const createdA = a.created.toUpperCase(); // ignore upper and lowercase
    const createdB = b.created.toUpperCase(); // ignore upper and lowercase
    if (createdA < createdB) {
      return -1;
    }
    if (createdA > createdB) {
      return 1;
    }
    return 0;
  });
  log(`OperatorService.ts::createDwollaTransfer() sorted transfers from Dwolla are ${JSON.stringify(transfers, null,2)}`);

  const transferToUse = sortedTransfers[sortedTransfers.length-1];

  if(!transferToUse){ 
    const error = `OperatorService.ts::createDwollaTransfer() No transfers exist for userId ${userId}, see logs for details`;
    console.log(error);
    if(!retryCount || retryCount < maxRetries){
      console.log(`OperatorService.ts::createDwollaTransfer() Waiting 3000ms before retrieving transfers from Dwolla and retrying this method. Retry count is ${retryCount ? retryCount : 0}`);
      await sleep(retryTimeoutMs);
      retryReponse = await createDwollaTransfer(fundingSourceLink, fundingTargetLink, amount, type, userId, operatorId, retryCount ? (retryCount+1): 1);
    }
    else
      throw error;
  }

  // Error checking
  if(transferToUse?._links["source-funding-source"].href != fundingSourceLink){
    const error = `OperatorService.ts::createDwollaTransfer() Transfer from Dwolla _links[destination-funding-source] of ${transferToUse._links["source-funding-source"].href} does not match expected fundingSourceLink of ${fundingSourceLink}`; 
    console.log(error);
    if(!retryCount || retryCount < maxRetries){
      console.log(`OperatorService.ts::createDwollaTransfer() Waiting 3000ms before retrieving transfers from Dwolla and retrying this method. Retry count is ${retryCount ? retryCount : 0}`);
      await sleep(retryTimeoutMs);
      retryReponse = await createDwollaTransfer(fundingSourceLink, fundingTargetLink, amount, type, userId, operatorId, retryCount ? (retryCount+1): 1);
    }
    else
      throw error;
  }
  if(transferToUse?._links["destination-funding-source"].href != fundingTargetLink){
    const error = `OperatorService.ts::createDwollaTransfer() Transfer from Dwolla _links[destination-funding-source] of ${transferToUse._links["destination-funding-source"].href} does not match expected fundingTargetLink of ${fundingTargetLink}`; 
    console.log(error);
    if(!retryCount || retryCount < maxRetries){
      console.log(`OperatorService.ts::createDwollaTransfer() Waiting 3000ms before retrieving transfers from Dwolla and retrying this method. Retry count is ${retryCount ? retryCount : 0}`);
      await sleep(retryTimeoutMs);
      retryReponse = await createDwollaTransfer(fundingSourceLink, fundingTargetLink, amount, type, userId, operatorId, retryCount ? (retryCount+1): 1);
    }
    else
      throw error;
  }
  if(parseFloat(transferToUse?.amount.value) != parseFloat(amount)){
    const error = `OperatorService.ts::createDwollaTransfer() Transfer from Dwolla amount.value of ${transferToUse.amount.value} does not match expected amount of ${amount}`; 
    console.log(error);
    if(!retryCount || retryCount < maxRetries){
      console.log(`OperatorService.ts::createDwollaTransfer() Waiting 3000ms before retrieving transfers from Dwolla and retrying this method. Retry count is ${retryCount ? retryCount : 0}`);
      await sleep(retryTimeoutMs);
      retryReponse = await createDwollaTransfer(fundingSourceLink, fundingTargetLink, amount, type, userId, operatorId, retryCount ? (retryCount+1): 1);
    }
    else
      throw error;
  }

  if(!retryReponse){
    const now = Date.now();
    const transfer: DwollaTransferService.ICreateDwollaTransferDBItem = {
      id: transferToUse.id,
      userId: userId,
      operatorId: operatorId,
      fundingSource: transferToUse._links["source-funding-source"].href,
      fundingTarget: transferToUse._links["destination-funding-source"].href,
      amount: transferToUse.amount.value,
      status: transferToUse.status,
      type: type,
      created: now,
      updated: now,
    };
    const transferDBItem: DwollaTransferService.IDwollaTransferDBItem = await DwollaTransferService.create(transfer);
    return transferDBItem;
  }
  else
    return retryReponse;

}

export async function deposit(
  userId: string,
  amount: string
): Promise<DwollaTransferService.IDwollaTransferDBItem> {
  const sortedOperatorStats = await getSortedOperators();
  const operatorToUse = sortedOperatorStats[0].operator;
  log(`OperatorService()::deposit() depositing to operator ${operatorToUse}`);

  const fundingSourceLink: string = await getFundingSourceLinkForUser(userId);
  const fundingTargetLink: string = process.env.OPERATOR_1_FUNDING_SOURCE;
  log(
    `OperatorService()::deposit() funding source for user is ${fundingSourceLink}`
  );
  log(
    `OperatorService()::deposit() funding target for user is ${fundingTargetLink}`
  );

  const transfer = await createDwollaTransfer(
    fundingSourceLink,
    fundingTargetLink,
    amount,
    "DEPOSIT",
    userId,
    operatorToUse
  );
  log(
    `OperatorService()::deposit() Dwolla transfer created and logged to database: ${JSON.stringify(
      transfer,
      null,
      2
    )}`
  );

  return transfer;
}

export async function webhookMint(id: string): Promise<boolean> {
  const transfer: DwollaTransferService.IDwollaTransferDBItem =
    await DwollaTransferService.getById(id);
  const result = await contracts.deposit(
    transfer.userId,
    transfer.amount,
    transfer.operatorId
  );
  return result.status;
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

export async function getTransfersForUser(
  userId: string
): Promise<ITransferEvent[]> {
  const transfers = await contracts.getTransfersForUser(userId);
  return transfers;
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
  let index = sortedOperatorStats.length - 1;

  // In the off chance that a single operator cannot
  // fulfill a large withdrawal, we need to iterate multiple
  // operators to serve the withdrawal

  while (amountToWithdraw.gtn(0)) {
    const operator = sortedOperatorStats[index];
    const operatorOutstandingFunds = new BN(
      web3Utils.toWei(operator.currentOutstanding, "ether")
    );

    // If this operator has enough, then withdraw the full amount
    if (operatorOutstandingFunds.gte(amountToWithdraw)) {
      log(
        `OperatorService::withdraw():: withdrawing ${amountToWithdraw.toString()} from operator ${
          operator.operator
        } who has ${operatorOutstandingFunds.toString()} in outstanding funds`
      );

      // Blockchain withdrawal first
      await contracts.withdraw(
        userId,
        web3Utils.fromWei(amountToWithdraw.toString()),
        operator.operator
      );

      // Then Dwolla withdrawal
      const fundingSourceLink: string = process.env.OPERATOR_1_FUNDING_SOURCE;
      const fundingTargetLink: string = await getFundingSourceLinkForUser(
        userId
      );
      await createDwollaTransfer(
        fundingSourceLink,
        fundingTargetLink,
        web3Utils.fromWei(amountToWithdraw.toString()),
        "WITHDRAWAL",
        userId,
        operator.operator
      );

      // Clear amountToWithdraw, we have satisfied the user's full redemption amount
      amountToWithdraw = new BN(0);
    }

    // Otherwise only withdraw the total this operator has
    else {
      log(
        `withdraw():: withdrawing ${operatorOutstandingFunds.toString()} from operator ${
          operator.operator
        } who has ${operatorOutstandingFunds.toString()} in outstanding funds`
      );

      // Blockchain withdrawal first
      await contracts.withdraw(
        userId,
        web3Utils.fromWei(operatorOutstandingFunds.toString()),
        operator.operator
      );

      // Then Dwolla withdrawal
      const fundingSourceLink: string = process.env.OPERATOR_1_FUNDING_SOURCE;
      const fundingTargetLink: string = await getFundingSourceLinkForUser(
        userId
      );
      await createDwollaTransfer(
        fundingSourceLink,
        fundingTargetLink,
        web3Utils.fromWei(operatorOutstandingFunds.toString()),
        "WITHDRAWAL",
        userId,
        operator.operator
      );

      // Reduce the amount remaining to withdraw and iterate to the next operator
      amountToWithdraw = amountToWithdraw.sub(operatorOutstandingFunds);
      index--;

      if (index < 0)
        throw Error(
          `withdraw():: Critical - cannot fulfil withdrawal ${amount} for userId ${userId}`
        );
    }
  }
  return amountToWithdraw.eqn(0);
}

export async function transferTo(
  fromUserId: string,
  toUserId: string,
  amount: string
): Promise<boolean> {
  return (await contracts.transferTo(fromUserId, toUserId, amount)).status;
}
