export interface HealthResponse {
  blockNumber: string;
  chainId: string;
  nodeInfo: string;
  token: string;
  countOfWallets: number;
  owner: string;
}

export interface IWallet {
  userId: string;
  address: string;
  createdBlock: string;
  availableBalance: number;
  totalBalance: number;
}

export interface Settlement {
  transactionId: string;
  settlementAmount: number;
}

export interface NewUser {
  userId: string;
}

export interface SettlementRequest {
  userId: string;
  transactionId: string;
  settlementAmount: number;
}
