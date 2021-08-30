/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  IDeposit,
  ITransferEvent,
  IWithdrawal,
  INewUser,
  IOperatorTotal,
} from "src/types";
import * as contracts from "./contracts";
import BN from "bn.js";
import * as web3Utils from "web3-utils";
import { createUnverifiedCustomer } from "./digital-banking/Dwolla";
import { DwollaUnverifiedCustomerRequest } from "./digital-banking/DwollaTypes";

// Do not convert to bytes32 here, it is done in the lower-level functions under ./contracts
export async function createUser(newUser: INewUser): Promise<string> {
  const request: DwollaUnverifiedCustomerRequest = {
    firstName: newUser.firstName,
    lastName: newUser.lastName,
    email: newUser.email,
    businessName: newUser.businessName,
    ipAddress: newUser.ipAddress,
    correlationId: newUser.email,
  };
  const id: string = await createUnverifiedCustomer(request);
  console.log(`Created new customer in Dwolla with URL ${id}`);
  return id;
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

export async function deposit(
  userId: string,
  amount: string
): Promise<boolean> {
  const sortedOperatorStats = await getSortedOperators();
  console.log(
    `deposit():: depositing to operator ${sortedOperatorStats[0].operator}`
  );
  const result = await contracts.deposit(
    userId,
    amount,
    sortedOperatorStats[0].operator
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
      console.log(
        `withdraw():: withdrawing ${amountToWithdraw.toString()} from operator ${
          operator.operator
        } who has ${operatorOutstandingFunds.toString()} in outstanding funds`
      );
      await contracts.withdraw(
        userId,
        web3Utils.fromWei(amountToWithdraw.toString()),
        operator.operator
      );
      amountToWithdraw = new BN(0);
    }

    // Otherwise only withdraw the total this operator has
    else {
      console.log(
        `withdraw():: withdrawing ${operatorOutstandingFunds.toString()} from operator ${
          operator.operator
        } who has ${operatorOutstandingFunds.toString()} in outstanding funds`
      );
      await contracts.withdraw(
        userId,
        web3Utils.fromWei(operatorOutstandingFunds.toString()),
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
