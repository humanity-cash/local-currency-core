/* eslint-disable @typescript-eslint/no-explicit-any */
import { NewUser, OperatorTotal } from "src/types";
import * as contracts from "./contracts";
import BN from "bn.js";

// Do not convert to bytes32 here, it is done in the lower-level functions under ./contracts

export async function createUser(newUser: NewUser): Promise<string> {
  return await contracts.newWallet(newUser.userId);
}

export async function deposit(
  userId: string,
  amount: string
): Promise<boolean> {
  
  // 1. Get funding statistics
  const operatorStats: OperatorTotal[] = await contracts.getFundingStatus();

  // 2. Sort by the currentOutstanding value - their current liabilities
  const sortedOperatorStats: OperatorTotal[] = operatorStats.sort((x, y) => {
    const a = new BN(x.currentOutstanding);
    const b = new BN(y.currentOutstanding);
    return a.eq(b) ? 0 : !a.lt(b) ? 1 : -1;
  });
  console.log(
    `deposit():: sorted operators are ${JSON.stringify(sortedOperatorStats, null,2)}`
  );
  console.log(
    `deposit():: depositing to operator ${sortedOperatorStats[0].operator}`
  );

  // 3. Deposit to the operator with the smallest current liabilities
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
  // 1. Get funding statistics
  const operatorStats: OperatorTotal[] = await contracts.getFundingStatus();

  // 2. Sort by the currentOutstanding value - their current liabilities
  const sortedOperatorStats: OperatorTotal[] = operatorStats.sort((x, y) => {
    const a = new BN(x.currentOutstanding);
    const b = new BN(y.currentOutstanding);
    return a.eq(b) ? 0 : !a.lt(b) ? 1 : -1;
  });
  console.log(
    `withdraw():: sorted operators are ${JSON.stringify(sortedOperatorStats,null,2)}`
  );
  console.log(
    `withdraw():: withdrawing from operator ${
      sortedOperatorStats[sortedOperatorStats.length - 1].operator
    }`
  );

  // 3. Withdraw from the operator with the largest current liabilities
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