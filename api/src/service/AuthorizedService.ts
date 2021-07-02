/* eslint-disable @typescript-eslint/no-explicit-any */
import { NewUser } from "src/types";
import * as contracts from "./contracts";

export async function createUser(newUser: NewUser): Promise<string> {
  // Do not convert to bytes32 here, it is done in contract only for new users so we can store the human legible userId on chain
  return await contracts.newWallet(newUser.userId);
}

export async function deposit(
  userId: string,
  amount: string
): Promise<boolean> {
  // Do not convert to bytes32 here, it is done in contract only for new users so we can store the human legible userId on chain
  return (await contracts.deposit(userId, amount)).status;
}

export async function transferTo(
  fromUserId: string,
  toUserId: string,
  amount: string
): Promise<boolean> {
  // Do not convert to bytes32 here, it is done in contract only for new users so we can store the human legible userId on chain
  return (await contracts.transferTo(fromUserId, toUserId, amount)).status;
}
