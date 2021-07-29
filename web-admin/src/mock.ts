import { ACHData, BlockchainData, ContractData } from "types";

const createMockContractsData = 
	(name: string, address: string, deployedAt: number, status: number, version: number): ContractData => {

	return { name, address, deployedAt, status, version };
}

export const MockContractsData = [
	createMockContractsData('Token', '0x0001', 1324171354, 1, 1.04),
	createMockContractsData('Wallet', '0x0001', 1403500365, 0, 0.15),
	createMockContractsData('Controller', '0x0001', 60483973, 1, 0.8),
];

export const MockACHData: ACHData[] = [
	{ userEmail: 'user@email.io', type: 'Funding', createdAt: 0, 
		confirmedAt: 0, amount: 20, bank: 'Bank Of Country', bankAccount: '1G1C1G2343ER',
		status: 'Success', transactionId: 234223
	},
	{ userEmail: 'user@email.io', type: 'Funding', createdAt: 0, 
		confirmedAt: 0, amount: 20, bank: 'Bank Of Country', bankAccount: '1G1C1G2343ER',
		status: 'Success', transactionId: 234223
	},
	{ userEmail: 'user@email.io', type: 'Funding', createdAt: 0, 
		confirmedAt: 0, amount: 20, bank: 'Bank Of Country', bankAccount: '1G1C1G2343ER',
		status: 'Success', transactionId: 234223
	},
	{ userEmail: 'user@email.io', type: 'Funding', createdAt: 0, 
		confirmedAt: 0, amount: 20, bank: 'Bank Of Country', bankAccount: '1G1C1G2343ER',
		status: 'Success', transactionId: 234223
	},
	{ userEmail: 'user@email.io', type: 'Funding', createdAt: 0, 
		confirmedAt: 0, amount: 20, bank: 'Bank Of Country', bankAccount: '1G1C1G2343ER',
		status: 'Success', transactionId: 234223
	},
	{ userEmail: 'user@email.io', type: 'Funding', createdAt: 0, 
		confirmedAt: 0, amount: 20, bank: 'Bank Of Country', bankAccount: '1G1C1G2343ER',
		status: 'Pending', transactionId: 254343
	},
	{ userEmail: 'user@email.io', type: 'Funding', createdAt: 0, 
		confirmedAt: 0, amount: 20, bank: 'Bank Of Country', bankAccount: '1G1C1G2343ER',
		status: 'Pending', transactionId: 254343
	},
	{ userEmail: 'user@email.io', type: 'Funding', createdAt: 0, 
		confirmedAt: 0, amount: 20, bank: 'Bank Of Country', bankAccount: '1G1C1G2343ER',
		status: 'Pending', transactionId: 254343
	},
	{ userEmail: 'user@email.io', type: 'Funding', createdAt: 0, 
		confirmedAt: 0, amount: 20, bank: 'Bank Of Country', bankAccount: '1G1C1G2343ER',
		status: 'Pending', transactionId: 254343
	},
	{ userEmail: 'user@email.io', type: 'Redemption', createdAt: 0, 
		confirmedAt: 0, amount: 20, bank: 'Bank Of Country', bankAccount: '1G1C1G2343ER',
		status: 'Fail', transactionId: 234343
	},
];

export const MockBCData: BlockchainData[] = [
	{
		transactionHash: '0x10000010000000',
		amount: 30,
		from: '0x10000000000000',
		to: '0x10000000000000',
		fromEmail: 'from@email.com',
		toEmail: 'to@email.com',
		status: 'Fail',
		isToMerchant: 0,
		confirmedAt: 0,
		createdAt: 0,
	},
	{
		transactionHash: '0x10000000030000',
		amount: 30,
		from: '0x10000000000000',
		to: '0x10000000000000',
		fromEmail: 'from@email.com',
		toEmail: 'to@email.com',
		status: 'Success',
		isToMerchant: 1,
		confirmedAt: 0,
		createdAt: 0,
	},
	{
		transactionHash: '0x10000000030000',
		amount: 30,
		from: '0x10000000000000',
		to: '0x10000000000000',
		fromEmail: 'from@email.com',
		toEmail: 'to@email.com',
		status: 'Success',
		isToMerchant: 1,
		confirmedAt: 0,
		createdAt: 0,
	},
	{
		transactionHash: '0x10000000030000',
		amount: 30,
		from: '0x10000000000000',
		to: '0x10000000000000',
		fromEmail: 'from@email.com',
		toEmail: 'to@email.com',
		status: 'Success',
		isToMerchant: 1,
		confirmedAt: 0,
		createdAt: 0,
	},
	{
		transactionHash: '0x10000000030000',
		amount: 30,
		from: '0x10000000000000',
		to: '0x10000000000000',
		fromEmail: 'from@email.com',
		toEmail: 'to@email.com',
		status: 'Success',
		isToMerchant: 1,
		confirmedAt: 0,
		createdAt: 0,
	},
	{
		transactionHash: '0x10000000030000',
		amount: 30,
		from: '0x10000000000000',
		to: '0x10000000000000',
		fromEmail: 'from@email.com',
		toEmail: 'to@email.com',
		status: 'Success',
		isToMerchant: 1,
		confirmedAt: 0,
		createdAt: 0,
	},
	{
		transactionHash: '0x10003000000000',
		amount: 30,
		from: '0x10000000000000',
		to: '0x10000000000000',
		fromEmail: 'from@email.com',
		toEmail: 'to@email.com',
		status: 'Success',
		isToMerchant: 1,
		confirmedAt: 0,
		createdAt: 0,
	},
];