interface ContractData {
	name: string;
	address: string;
	deployedAt: number;
	status: number;
	actions: number;
}

function createMockData(name: string, address: string, deployedAt: number, status: number, actions: number): ContractData {
	return { name, address, deployedAt, status, actions };
}

export const MockContractsData = [
	createMockData('Token', 'IN', 1324171354, 3287263, 3287263),
	createMockData('Wallet', 'CN', 1403500365, 9596961, 3287263),
	createMockData('Controller', 'IT', 60483973, 301340, 3287263),
	createMockData('Controller', '1T', 60483973, 301340, 3287263),
	createMockData('Controller', '2T', 60483973, 301340, 3287263),
	createMockData('Controller', '3T', 60483973, 301340, 3287263),
	createMockData('Controller', '4T', 60483973, 301340, 3287263),
	createMockData('Controller', '5T', 60483973, 301340, 3287263),
	createMockData('Controller', '6T', 60483973, 301340, 3287263),
	createMockData('Controller', '44', 60483973, 301340, 3287263),
	createMockData('Controller', 'I1', 60483973, 301340, 3287263),
];