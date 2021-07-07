export interface HealthResponse {
  blockNumber: number;
  chainId: number;
  nodeInfo: string;
  token: string;
  walletCount: number;
  owner: string;
  walletFactory: string;
}

export interface IWallet {
  userId: string;
  address: string;
  createdBlock: string;
  availableBalance: number;
  totalBalance: number;
}

export interface NewUser {
  userId: string;
}
