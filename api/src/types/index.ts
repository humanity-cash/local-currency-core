import { Response } from "dwolla-v2";
import { ObjectId } from "mongoose";

export enum TransferType {
  IN = "IN",
  OUT = "OUT",
}

export type WalletAddress = string;

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

export interface BaseUser {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface IDwollaNewUserInput extends BaseUser {
  email: string;
  rbn?: string;
  ipAddress?: string;
  correlationId: string;
}

export interface IDwollaNewUserResponse {
  userId: string;
  resourceUri: string;
}

export type ICustomerDwollaId = { "customer.dwollaId": DwollaId };

export type IBusinessDwollaId = { "business.dwollaId": DwollaId };

export interface IDBMiniNewBusinessInput {
  story: string;
  tag: string;
  avatar: string;
  type: string;
  rbn: string;
  industry: string;
  ein: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  phoneNumber: string;
  owner: BaseUser;
}

export interface IDBMiniNewCustomerInput extends BaseUser {
  avatar: string;
  tag: string;
}

export interface IDBUser {
  consent: boolean;
  verifiedCustomer: boolean;
  verifiedBusiness: boolean;
  email: string;
  customer?: Customer;
  business?: Business;
  dbId: ObjectId;
}

export interface IAPINewUser {
  email: string;
  consent: boolean;
  type: "customer" | "business";
  isNew?: boolean;
  business?: IDBMiniNewBusinessInput;
  customer?: IDBMiniNewCustomerInput;
}

export interface IUpdateUser {
  verifiedCustomer?: boolean;
  verifiedBusiness?: boolean;
  customer?: Customer;
  business?: Business;
}

export interface INewUserInput {
  consent: boolean;
  verifiedCustomer: boolean;
  verifiedBusiness: boolean;
  email: string;
  customer?: Customer;
  business?: Business;
}

export interface Business {
  story: string;
  tag: string;
  avatar: string;
  type: string;
  walletAddress?: WalletAddress;
  rbn: string;
  industry: string;
  ein: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  phoneNumber: string;
  dwollaId?: DwollaId;
  resourceUri?: string;
  owner: BaseUser;
}

export interface Customer extends BaseUser {
  avatar: string;
  tag: string;
  dwollaId?: DwollaId;
  walletAddress?: WalletAddress;
  resourceUri?: string;
}

export type DwollaId = string;

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
  type?: TransferType;
}

export interface IOperatorTotal {
  operator: string;
  totalDeposits: string;
  totalWithdrawals: string;
  currentOutstanding: string;
  deposits: IDeposit[];
  withdrawals: IWithdrawal[];
}

export type IMongooseMetadata = { __v: number; _id: ObjectId };

export type UserId = string;
export type UserName = string;
export type UnixDate = number;

export interface PeriodReportInput {
  userId: UserId;
  fromTime: UnixDate;
  toTime: UnixDate;
}

export interface Report {
  TransferType: TransferType;
  amount: number;
  from: UserName;
  to: UserName;
  date: UnixDate;
}
