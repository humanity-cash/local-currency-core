import * as Kit from "@celo/contractkit";
import { HealthResponse, Settlement, IWallet } from "src/types";
import { toBytes32 } from "src/utils/crypto";
import * as contracts from "./contracts";

export async function health(): Promise<HealthResponse> {
  const kit = Kit.newKit(process.env.LOCAL_CURRENCY_RPC_HOST);
  const promises = [
    kit.web3.eth.getBlockNumber(),
    kit.web3.eth.getChainId(),
    kit.web3.eth.getNodeInfo(),
    this.token(),
    contracts.owner(),
  ];
  const results = await Promise.all(promises);

  const response: HealthResponse = {
    blockNumber: results[0],
    chainId: results[1],
    nodeInfo: results[2],
    token: results[3],
    countOfWallets: results[4],
    owner: results[5],
  };
  return response;
}

export async function token(): Promise<string> {
  return await contracts.token();
}

export async function getWalletAddress(userId: string): Promise<string> {
  return await contracts.getWalletAddress(toBytes32(userId));
}

export async function balanceOfWallet(userId: string): Promise<string> {
  return await contracts.balanceOfWallet(toBytes32(userId));
}

export async function getWallet(userId: string): Promise<IWallet> {
  const address = await this.walletAddress(userId);
  const wallet: IWallet = await contracts.getWalletForAddress(address);
  return wallet;
}

export async function getAllBeneficiaries(): Promise<IWallet[]> {
  const count = await contracts.getWalletCount();
  const users: IWallet[] = [];

  for (let i = 0; i < count; i++) {
    const address = await contracts.getWalletAddressAtIndex(i);
    const user: IWallet = await contracts.getWalletForAddress(address);
    users.push(user);
  }
  return users;
}

export async function getSettlementsForAddress(
  address: string
): Promise<Settlement[]> {
  return await contracts.getSettlementsForAddress(address);
}
