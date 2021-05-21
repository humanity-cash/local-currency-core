import * as CeloUBI from "./celoubi/CeloUbi";
import * as Kit from "@celo/contractkit";
import { toBytes32 } from "../utils/utils";
import {
  HealthResponse,
  UBIBeneficiary,
  Authorization,
  Settlement,
} from "../types/types";

export async function health(): Promise<HealthResponse> {
  const kit = Kit.newKit(process.env.CELO_UBI_RPC_HOST);
  const promises = [
    kit.web3.eth.getBlockNumber(),
    kit.web3.eth.getChainId(),
    kit.web3.eth.getNodeInfo(),
    this.disbursementWei(),
    this.cUBIAuthToken(),
    this.cUSDToken(),
    this.reconciliationAccount(),
    CeloUBI.getBeneficiaryCount(),
  ];
  const results = await Promise.all(promises);

  const response: HealthResponse = {
    blockNumber: results[0],
    chainId: results[1],
    nodeInfo: results[2],
    disbursementWei: results[3],
    cUBIAuthToken: results[4],
    cUSDToken: results[5],
    reconciliationAccount: results[6],
    countOfBeneficiaries: results[7],
  };
  return response;
}

export async function disbursementWei(): Promise<number> {
  return await CeloUBI.disbursementWei();
}

export async function cUSDToken(): Promise<string> {
  return await CeloUBI.cUSDToken();
}

export async function cUBIAuthToken(): Promise<string> {
  return await CeloUBI.cUBIAuthToken();
}

export async function reconciliationAccount(): Promise<string> {
  return await CeloUBI.reconciliationAccount();
}

export async function beneficiaryAddress(userId: string): Promise<string> {
  return await CeloUBI.beneficiaryAddress(toBytes32(userId));
}

export async function balanceOfUBIBeneficiary(userId: string): Promise<string> {
  return await CeloUBI.balanceOfUBIBeneficiary(toBytes32(userId));
}

export async function authbalanceOfUBIBeneficiary(
  userId: string
): Promise<string> {
  return await CeloUBI.authBalanceOfUBIBeneficiary(toBytes32(userId));
}

export async function getBeneficiary(userId: string): Promise<UBIBeneficiary> {
  const address = await this.beneficiaryAddress(userId);
  const beneficiary: UBIBeneficiary = await CeloUBI.getUBIBeneficiaryForAddress(
    address
  );
  return beneficiary;
}

export async function getAllBeneficiaries(): Promise<UBIBeneficiary[]> {
  const count = await CeloUBI.getBeneficiaryCount();
  const users: UBIBeneficiary[] = [];

  for (let i = 0; i < count; i++) {
    const address = await CeloUBI.getBeneficiaryAddressAtIndex(i);
    const user: UBIBeneficiary = await CeloUBI.getUBIBeneficiaryForAddress(
      address
    );
    users.push(user);
  }
  return users;
}

export async function getAuthorizationsForAddress(
  address: string
): Promise<Authorization[]> {
  return await CeloUBI.getAuthorizationsForAddress(address);
}

export async function getSettlementsForAddress(
  address: string
): Promise<Settlement[]> {
  return await CeloUBI.getSettlementsForAddress(address);
}
