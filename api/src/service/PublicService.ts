import { HealthResponse, IWallet, OperatorTotal } from "src/types";
import * as contracts from "./contracts";
import { getProvider } from "src/utils/getProvider";

export async function health(): Promise<HealthResponse> {
  const { web3 } = await getProvider();
  const [
    blockNumber,
    chainId,
    nodeInfo,
    token,
    walletCount,
    owner,
    walletFactory,
  ] = await Promise.all([
    web3.eth.getBlockNumber(),
    web3.eth.getChainId(),
    web3.eth.getNodeInfo(),
    this.token(),
    contracts.getWalletCount(),
    contracts.owner(),
    contracts.walletFactory(),
  ]);

  const response: HealthResponse = {
    blockNumber,
    chainId,
    nodeInfo,
    token,
    walletCount,
    owner,
    walletFactory,
  };
  return response;
}

export async function token(): Promise<string> {
  return await contracts.token();
}

export async function getWalletAddress(userId: string): Promise<string> {
  return await contracts.getWalletAddress(userId);
}

export async function balanceOfWallet(userId: string): Promise<string> {
  return await contracts.balanceOfWallet(userId);
}

export async function getWallet(userId: string): Promise<IWallet> {
  const address = await this.getWalletAddress(userId);
  const wallet: IWallet = await contracts.getWalletForAddress(address);
  return wallet;
}

export async function getAllWallets(): Promise<IWallet[]> {
  const count = await contracts.getWalletCount();
  const users: IWallet[] = [];

  for (let i = 0; i < count; i++) {
    const address = await contracts.getWalletAddressAtIndex(i);
    const user: IWallet = await contracts.getWalletForAddress(address);
    users.push(user);
  }
  return users;
}

export async function getFundingStatus(): Promise<OperatorTotal[]> {
  return await contracts.getFundingStatus();
}