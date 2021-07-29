export interface ContractData {
	name: string;
	address: string;
	deployedAt: number;
	status: number;
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
type UserEmail = string;
type Hash = string;

export interface BlockchainData {
	transactionHash: Hash;
	from: Hash;
	to: Hash;
	fromEmail: UserEmail;
	toEmail: UserEmail;
	isToMerchant: 0 | 1; //reciever is merchant
	createdAt: Time;
	confirmedAt: Time;
	amount: number;
	status: TransactionStatus;
}

export interface ACHData {
	userEmail: UserEmail;
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
