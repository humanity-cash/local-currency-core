import * as CeloUBI from "./celoubi";

export async function reconcile(): Promise<any> {
  return await CeloUBI.reconcile();
}

export async function transferOwnership(newOwner: string): Promise<any> {
  return await CeloUBI.transferOwnership(newOwner);
}

export async function setCustodian(newCustodian: string): Promise<any> {
  return await CeloUBI.setCustodian(newCustodian);
}

export async function setDisbursementWei(
  newDisbursementWei: number
): Promise<any> {
  return await CeloUBI.setDisbursementWei(newDisbursementWei);
}
