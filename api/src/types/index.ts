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
export interface IFundingEvent {
  operator: string;
  userId: string;
  value: string;
  transactionHash: string;
  blockNumber: string;
}

export interface OperatorTotal {
  operator: string,
  totalDeposits: string,
  totalWithdrawals: string,
  currentOutstanding: string,
  deposits: IFundingEvent[],
  withdrawals: IFundingEvent[]
}
