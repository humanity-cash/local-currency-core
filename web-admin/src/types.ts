import { AxiosResponse } from "axios";

export type AxiosPromiseResponse<T = unknown> = AxiosResponse<T>;

export interface ContractData {
  name: string;
  address: string;
  deployedAt: number;
  status: number | undefined;
  version: number;
}

export interface ContractsState {
  data: ContractData[];
}

export interface ModalState {
  type: string;
  isOpen: boolean;
  modalProps: Record<string, unknown>;
}

export interface BlockchainDataState {
  data: BlockchainData[];
}

type TransactionStatus = "Pending" | "Success" | "Fail";
type Time = number;
type ACHType = "Funding" | "Redemption";
type Username = string;
type Hash = string;

export interface UserData {
  name: string;
  email: string;
  dowllaId: string;
  outstandingBalance: number;
  lastLogin: Time;
  blockchainAddress: string;
  address: string;
  type: "Business" | "Personal";
}

export interface BlockchainData {
  transactionHash: Hash;
  from: Hash;
  to: Hash;
  fromUser: Username;
  toUser: Username;
  type: "Deposit" | "Withdraw" | "Transfer In" | "Transfer Out";
  createdAt: Time;
  amount: number;
  blocksConfirmed: number;
}

export interface ACHData {
  username: Username;
  type: ACHType;
  transactionId: number;
  createdAt: Time;
  confirmedAt: Time;
  amount: number;
  userBank: string;
  berksharesBank: string;
  bankAccount: string;
  status: TransactionStatus;
}

export interface IACHTransaction {
  transactionHash: string;
  blockNumber: number;
  timestamp: number;
  userId: string;
  operator: string;
  value: string;
  type: "Transfer In" | "Transfer Out" | "Deposit" | "Withdraw";
}

export interface IBlockchainTransaction {
  fromUserId: string;
  fromAddress: string;
  toUserId: string;
  toAddress: string;
  value: string;
  transactionHash: string;
  blockNumber: number;
  timestamp: number;
  type: "Transfer In" | "Transfer Out" | "Deposit" | "Withdraw" | "Transfer";
}

export interface ACHDataState {
  data: ACHData[];
}

export enum UserTables {
  UserACHTRansactions,
  UserBlockchainTransactions,
}
