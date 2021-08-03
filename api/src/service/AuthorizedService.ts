/* eslint-disable @typescript-eslint/no-explicit-any */
import { NewUser } from "src/types";
import * as contracts from "./contracts";

// Do not convert to bytes32 here, it is done in the lower-level functions under ./contracts

export async function createUser(newUser: NewUser): Promise<string> {
  return await contracts.newWallet(newUser.userId);
}

export async function deposit(
  userId: string,
  amount: string
): Promise<boolean> {
  return (await contracts.deposit(userId, amount)).status;
}

export async function withdraw(
  userId: string,
  amount: string
): Promise<boolean> {
  return (await contracts.withdraw(userId, amount)).status;
}

export async function transferTo(
  fromUserId: string,
  toUserId: string,
  amount: string
): Promise<boolean> {
  return (await contracts.transferTo(fromUserId, toUserId, amount)).status;
}
