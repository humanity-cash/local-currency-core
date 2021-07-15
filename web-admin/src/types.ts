
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