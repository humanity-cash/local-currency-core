import { Response } from "dwolla-v2";
export interface HealthResponse {
  blockNumber: number;
  chainId: number;
  nodeInfo: string;
  token: string;
  walletCount: string;
  owner: string;
  walletFactory: string;
}
export interface ITransferOwnerRequest {
  newOwner: string;
  userId?: string;
}
export interface IWallet {
  userId: string;
  address: string;
  createdBlock: string;
  createdTimestamp: string | number;
  availableBalance: number;
  totalBalance: number;
  customer?: Response;
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
  authUserId: string;
}
export interface INewUserResponse {
  userId: string;
  resourceUri: string;
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
  type: string;
}
export interface IOperatorTotal {
  operator: string;
  totalDeposits: string;
  totalWithdrawals: string;
  currentOutstanding: string;
  deposits: IDeposit[];
  withdrawals: IWithdrawal[];
}
