export interface ContractData {
	name: string;
	address: string;
	deployedAt: number;
	status: number;
	actions: number;
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

export interface BlockchainData {
	from: string;
	to: string;
	time: number;
	amount: number;
	status: string;
}

export interface ACHData {
	user: string;
	type: 'Funding' | 'Redemption';
	time: number;
	amount: number;
	bank: string;
	status: string;
}

export interface ACHDataState {
	data: ACHData[]
}
