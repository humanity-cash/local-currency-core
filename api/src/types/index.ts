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
export interface INewUser {
  firstName: string;
  lastName: string;
  email: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  businessName?: string;
  ipAddress?: string;
  userId: string;
}

export interface IEventBase {
  transactionHash: string;
  blockNumber: number;
  timestamp: string | number;
}
export interface IDeposit extends IEventBase {
  operator: string;
  userId: string;
  value: string;
}

export interface IWithdrawal extends IEventBase {
  operator: string;
  userId: string;
  value: string;
}
export interface ITransferEvent extends IEventBase {
  fromUserId: string;
  fromAddress: string;
  toUserId: string;
  toAddress: string;
  value: string;
}
export interface IOperatorTotal {
  operator: string;
  totalDeposits: string;
  totalWithdrawals: string;
  currentOutstanding: string;
  deposits: IDeposit[];
  withdrawals: IWithdrawal[];
}
