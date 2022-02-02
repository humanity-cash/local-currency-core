/* eslint-disable @typescript-eslint/no-explicit-any */
import * as contracts from "./contracts";
import { TransactionReceipt } from "web3-core";

export async function transferContractOwnership(
  newOwner: string
): Promise<TransactionReceipt> {
  return await contracts.transferContractOwnership(newOwner);
}

export async function transferWalletOwnership(
  newOwner: string,
  userId: string
): Promise<TransactionReceipt> {
  return await contracts.transferWalletOwnership(newOwner, userId);
}

export async function pause(): Promise<TransactionReceipt> {
  return await contracts.pause();
}

export async function unpause(): Promise<TransactionReceipt> {
  return await contracts.unpause();
}
