/* eslint-disable @typescript-eslint/no-explicit-any */
import * as contracts from "./contracts";

export async function reconcile(): Promise<any> {
  return await contracts.reconcile();
}

export async function transferOwnership(newOwner: string): Promise<any> {
  return await contracts.transferOwnership(newOwner);
}
