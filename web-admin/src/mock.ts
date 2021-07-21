interface ContractData {
	name: string;
	address: string;
	deployedAt: number;
	status: number;
	actions: number;
}

function createMockContractsData(name: string, address: string, deployedAt: number, status: number, actions: number): ContractData {
	return { name, address, deployedAt, status, actions };
}

export const MockContractsData = [
	createMockContractsData('Token', 'IN', 1324171354, 3287263, 3287263),
	createMockContractsData('Wallet', 'CN', 1403500365, 9596961, 3287263),
	createMockContractsData('Controller', 'IT', 60483973, 301340, 3287263),
];

function createMockACHData(user: string, type: string, time: number, status: number, amount: number, bank: string) {
	return { user, type, time, status, amount, bank };
}

function createMockBCData(from: string, to: string, time: number, status: number, amount: number) {
	return { from, to, time, status, amount };
}

export const MockACHData = [
	createMockACHData('user x', 'Funding', 1324171354, 0, 3287263, 'bank'),
	createMockACHData('user 1', 'Redepmtion', 1324171354, 0, 3287263, 'bank'),
];

export const MockBCData = [
	createMockBCData('0x1', '0x2', 1324171354, 0, 3287263),
	createMockBCData('0x2', '0x1', 1324171354, 0, 3287263),
];