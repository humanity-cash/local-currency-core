import { Response } from "dwolla-v2";
import { ObjectId } from "mongoose";

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

export interface IDowllaNewUser {
  email: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  rbn?: string;
  ipAddress?: string;
  authUserId: string;
}

export interface BusinessDetails {
  story: string,
  tag: string,
  avatar: string,
  type: string,
  rbn: string,
  industry: string,
  ein: string,
  address1: string,
  address2: string,
  city: string,
  state: string,
  postalCode: string,
  phoneNumber: string,
  owner: {
    firstName: string,
    lastName: string,
    address1: string,
    address2: string,
    city: string,
    state: string,
    postalCode: string
  }
}

export interface CustomerDetails {
  avatar: string;
  tag: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  firstName: string;
  lastName: string;
}

export interface INewUser {
  email: string;
  consent: boolean;
  dowllaDetails: IDowllaNewUser;
  businessDetails?: BusinessDetails;
  customerDetails?: CustomerDetails;
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

export interface UpdateUser {
	verifiedCustomer?: boolean
	verifiedBusiness?: boolean
	customer?: Customer
	business?: Business
}

export interface IAddCustomerVerification {
	customer: Customer
}

export interface IAddBusinessVerification {
	business: Business
}

export interface User {
	consent: boolean
	verifiedCustomer: boolean
	verifiedBusiness: boolean
	email: string
	customer?: Customer
	business?: Business
}

export interface Business {
	story: string,
	tag: string,
	avatar: string,
	type: string,
	rbn: string,
	industry: string,
	ein: string,
	address1: string,
	address2: string,
	city: string,
	state: string,
	postalCode: string,
	phoneNumber: string,
	dowllaId: DowllaId,
	resourceUri: string,
	owner: {
		firstName: string,
		lastName: string,
		address1: string,
		address2: string,
		city: string,
		state: string,
		postalCode: string
	}
}

export interface Customer {
	avatar: string,
	tag: string,
	address1: string,
	address2: string,
	city: string,
	state: string,
	postalCode: string,
	firstName: string,
	lastName: string,
	dowllaId: DowllaId,
	resourceUri: string,
}

export type DowllaId = string;

export type ICustomerDowllaId = { customer: { dowllaId: DowllaId }};

export type IBusinessDowllaId = { business: { dowllaId: DowllaId }};

export interface INewBusinessDocument {
	consent: boolean
	verifiedCustomer: boolean
	verifiedBusiness: boolean
	business: Business & { _id: ObjectId }
	email: string
	createdAt: Date
	updatedAt: Date
	dbId: ObjectId 
}

export interface INewCustomerDocument {
	consent: boolean
	verifiedCustomer: boolean
	verifiedBusiness: boolean
	customer: Customer & { _id: ObjectId }
	email: string
	createdAt: Date
	updatedAt: Date
	dbId: ObjectId 
}

export type IMongooseMetadata = { __v: number; _id: ObjectId };