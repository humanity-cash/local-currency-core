export interface ContractData {
	name: string;
	address: string;
	deployedAt: number;
	status: number | undefined;
	version: number;
}

export interface ContractsState {
	data: ContractData[]
}

export interface ModalState {
	type: string;
	isOpen: boolean;
	modalProps: {};
}

export interface BlockchainDataState {
	data: BlockchainData[]
}

type TransactionStatus = 'Pending' | 'Success' | 'Fail';
type Time = number;
type ACHType = 'Funding' | 'Redemption';
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
	type: 'Buisness' | 'Private';
}

export interface BlockchainData {
	transactionHash: Hash;
	from: Hash;
	to: Hash;
	fromUser: Username;
	toUser: Username;
	type: 'Burn' | 'Mint' | 'P2P'; //reciever is merchant
	createdAt: Time;
	confirmedAt: Time;
	amount: number;
	status: TransactionStatus;
}

export interface ACHData {
	username: Username;
	type: ACHType;
	transactionId: number;
	createdAt: Time;
	confirmedAt: Time;
	amount: number;
	bank: string;
	bankAccount: string;
	status: TransactionStatus;
}

export interface ACHDataState {
	data: ACHData[]
}

export enum UserTables {
	UserACHTRansactions,
	UserBlockchainTransactions
}
