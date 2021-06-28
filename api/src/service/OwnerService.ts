/* eslint-disable @typescript-eslint/no-explicit-any */
import * as contracts from "./contracts";

export async function reconcile(): Promise<any> {
  return await contracts.reconcile();
}

export async function transferContractOwnership(
  newOwner: string
): Promise<any> {
  return await contracts.transferContractOwnership(newOwner);
}

export async function transferWalletOwnership(
  newOwner: string,
  userId: string
): Promise<any> {
  return await contracts.transferWalletOwnership(newOwner, userId);
}
