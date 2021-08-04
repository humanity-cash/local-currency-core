/* eslint-disable @typescript-eslint/no-explicit-any */
import { NewUser, OperatorTotal } from "src/types";
import * as contracts from "./contracts";
import BN from "bn.js";

// Do not convert to bytes32 here, it is done in the lower-level functions under ./contracts

export async function createUser(newUser: NewUser): Promise<string> {
  return await contracts.newWallet(newUser.userId);
}

const sortOperatorsFunc = (x: OperatorTotal, y: OperatorTotal) => {
  const a = new BN(x.currentOutstanding);
  const b = new BN(y.currentOutstanding);
  return a.eq(b) ? 0 : !a.lt(b) ? 1 : -1;
};

async function getSortedOperators(): Promise<OperatorTotal[]> {
  const operatorStats: OperatorTotal[] = await contracts.getFundingStatus();
  const sortedOperatorStats: OperatorTotal[] =
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

export async function withdraw(
  userId: string,
  amount: string
): Promise<boolean> {
  const sortedOperatorStats = await getSortedOperators();
  console.log(
    `withdraw():: withdrawing from operator ${
      sortedOperatorStats[sortedOperatorStats.length - 1].operator
    }`
  );
  const result = await contracts.withdraw(
    userId,
    amount,
    sortedOperatorStats[sortedOperatorStats.length - 1].operator
  );
  return result.status;
}

export async function transferTo(
  fromUserId: string,
  toUserId: string,
  amount: string
): Promise<boolean> {
  return (await contracts.transferTo(fromUserId, toUserId, amount)).status;
}
