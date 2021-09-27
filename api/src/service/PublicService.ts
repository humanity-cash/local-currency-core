import {
  HealthResponse,
  IWallet,
  IOperatorTotal,
  IDeposit,
  IWithdrawal,
  ITransferEvent,
} from "src/types";
import { Response } from "dwolla-v2";
import * as contracts from "./contracts";
import { getProvider } from "src/utils/getProvider";
import { getDwollaCustomerById } from "./digital-banking/DwollaService";

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

async function getEnrichedWallet(
  address: string,
  userId: string
): Promise<IWallet> {
  const results = await Promise.all([
    contracts.getWalletForAddress(address),
    getDwollaCustomerById(userId),
  ]);
  const wallet: IWallet = results[0];
  const customer: Response = results[1];
  wallet.customer = customer;
  return wallet;
}

export async function getWallet(userId: string): Promise<IWallet> {
  const address = await this.getWalletAddress(userId);
  return await getEnrichedWallet(address, userId);
}

export async function getAllWallets(): Promise<IWallet[]> {
  const count = await contracts.getWalletCount();
  const users: IWallet[] = [];
  for (let i = 0; i < parseInt(count); i++) {
    const address = await contracts.getWalletAddressAtIndex(i);
    const wallet: IWallet = await contracts.getWalletForAddress(address);
    users.push(wallet);
  }
  return users;
}

export async function getFundingStatus(): Promise<IOperatorTotal[]> {
  return await contracts.getFundingStatus();
}

export async function getDeposits(): Promise<IDeposit[]> {
  return await contracts.getDeposits();
}

export async function getWithdrawals(): Promise<IWithdrawal[]> {
  return await contracts.getWithdrawals();
}

export async function getTransfers(): Promise<ITransferEvent[]> {
  return await contracts.getTransfers();
}
