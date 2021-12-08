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
import { getOperatorUserId, log } from "src/utils";
import * as web3Utils from "web3-utils";
import * as contracts from "./contracts";
import {
  createTransfer,
  createUnverifiedCustomer,
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
  operatorId: string
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

  // 2 Inititate Dwolla transfer
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
    fundingTransferId: transferToUse.body.id,
    userId: userId,
    operatorId: operatorId,
    fundingSource: transferToUse.body._links["source-funding-source"].href,
    fundingTarget: transferToUse.body._links["destination-funding-source"].href,
    amount: transferToUse.body.amount.value,
    fundingStatus: transferToUse.body.status,
    type: type,
    created: now,
    updated: now,
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
  log(`OperatorService()::deposit() depositing to operator ${operatorToUse}`);

  const fundingSourceLink: string = await getFundingSourceLinkForUser(userId);
  const operatorUserId: string = await getOperatorUserId(operatorToUse);
  const fundingTargetLink: string = await getFundingSourceLinkForUser(
    operatorUserId
  );
  log(
    `OperatorService()::deposit() funding source is user ${userId} with funding source ${fundingSourceLink}`
  );
  log(
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
  log(
    `OperatorService()::deposit() Dwolla transfer created and logged to database: ${JSON.stringify(
      transfer,
      null,
      2
    )}`
  );

  return transfer;
}

export async function webhookMint(fundingTransferId: string): Promise<boolean> {
  const transfer: DwollaTransferService.IDwollaTransferDBItem =
    await DwollaTransferService.getByFundingTransferId(fundingTransferId);
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
  const communityChestAddress = await contracts.communityChestAddress();

  const transfers = await contracts.getTransfersForUser(userId);
  return Promise.all(
    transfers.map(async function (t) {
      const fromUserData =
        t.fromAddress == communityChestAddress
          ? undefined
          : await getUserData(t.fromAddress);
      const toUserData =
        t.toAddress == communityChestAddress
          ? undefined
          : await getUserData(t.toAddress);
      return {
        ...t,
        fromName:
          t.fromAddress == communityChestAddress
            ? "Transfer from Community Chest"
            : fromUserData?.data?.name,
        toName:
          t.toAddress == communityChestAddress
            ? "Transfer to Community Chest"
            : toUserData?.data?.name,
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
      await contracts.withdraw(
        userId,
        web3Utils.fromWei(amountToWithdraw.toString()),
        operator.operator
      );

      // Then Dwolla withdrawal
      const operatorUserId = await getOperatorUserId(operator.operator);
      const fundingSourceLink: string = await getFundingSourceLinkForUser(
        operatorUserId
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
        operator.operator
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
      await contracts.withdraw(
        userId,
        web3Utils.fromWei(operatorOutstandingFunds.toString()),
        operator.operator
      );

      // Then Dwolla withdrawal
      const operatorUserId = await getOperatorUserId(operator.operator);
      const fundingSourceLink: string = await getFundingSourceLinkForUser(
        operatorUserId
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
        operator.operator
      );

      // Reduce the amount remaining to withdraw and iterate to the next operator
      amountToWithdraw = amountToWithdraw.sub(operatorOutstandingFunds);

      if (index >= sortedOperatorStats?.length)
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
  amount: string,
  roundUpAmount = "0"
): Promise<boolean> {
  return (
    await contracts.transferTo(fromUserId, toUserId, amount, roundUpAmount)
  ).status;
}
