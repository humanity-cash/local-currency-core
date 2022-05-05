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
import { UserService } from "src/database/service/index";
import { log } from "src/utils";

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
    paused,
  ] = await Promise.all([
    web3.eth.getBlockNumber(),
    web3.eth.getChainId(),
    web3.eth.getNodeInfo(),
    this.token(),
    contracts.getWalletCount(),
    contracts.owner(),
    contracts.walletFactory(),
    contracts.paused(),
  ]);

  const controller = process.env.LOCAL_CURRENCY_ADDRESS;
  const controllerStatus = paused ? "PAUSED" : "ACTIVE";

  const response: HealthResponse = {
    blockNumber,
    chainId,
    nodeInfo,
    token,
    controller,
    walletCount,
    owner,
    walletFactory,
    controllerStatus,
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
  const users = await UserService.getAll();
  const enrichedUsers: IWallet[] = [];

  for (let i = 0; i < users.length; i++) {
    const currentUser = users[i];

    if (currentUser.verifiedCustomer && currentUser.customer.walletAddress) {
      const enrichedWallet = await getEnrichedWallet(
        currentUser.customer.walletAddress,
        currentUser.customer.dwollaId
      );
      log(`Enriched user is ${JSON.stringify(enrichedWallet, null, 2)}`);
      enrichedUsers.push(enrichedWallet);
    }
    if (currentUser.verifiedBusiness && currentUser.business.walletAddress) {
      const enrichedWallet = await getEnrichedWallet(
        currentUser.business.walletAddress,
        currentUser.business.dwollaId
      );
      log(`Enriched user is ${JSON.stringify(enrichedWallet, null, 2)}`);
      enrichedUsers.push(enrichedWallet);
    }
  }
  return enrichedUsers;
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
