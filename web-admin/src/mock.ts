import { ACHData, BlockchainData, ContractData, UserData } from "types";

const createMockContractsData = 
	(name: string, address: string, deployedAt: number, status: number | undefined, version: number): ContractData => {

	return { name, address, deployedAt, status, version };
}

export const MockContractsData = [
	createMockContractsData('Token', '0x0001', 1324171354, undefined, 1.04),
	createMockContractsData('Wallet', '0x0001', 1403500365, undefined, 0.15),
	createMockContractsData('Controller', '0x0001', 60483973, 1, 0.8),
];

export const MockUserData: UserData[] = [
	{ 
		email: 'email@email.com', name: 'John Doe', 
		dowllaId: '9832322', outstandingBalance: 322,
		lastLogin: 9983283232, type: 'Private', 
		address: 'Holloway 89832, Boston', 
		blockchainAddress: '0x00000003220032'
	},
	{
		email: 'email@email.com', name: 'John Doe', 
		dowllaId: '9832322', outstandingBalance: 322,
		lastLogin: 9983283232, type: 'Private', 
		address: 'Holloway 89832, Boston', 
		blockchainAddress: '0x00000003220032'
	},
	{
		email: 'email@email.com', name: 'John Doe', 
		dowllaId: '9832322', outstandingBalance: 322,
		lastLogin: 9983283232, type: 'Private', 
		address: 'Holloway 89832, Boston', 
		blockchainAddress: '0x00000003220032'

	},
];

export const MockACHData: ACHData[] = [
	{ username: 'John Doe', type: 'Funding', createdAt: 0, 
		confirmedAt: 0, amount: 20, bank: 'Bank Of Country', bankAccount: '1G1C1G2343ER',
		status: 'Success', transactionId: 234223
	},
	{ username: 'John Doe', type: 'Funding', createdAt: 0, 
		confirmedAt: 0, amount: 20, bank: 'Bank Of Country', bankAccount: '1G1C1G2343ER',
		status: 'Success', transactionId: 234223
	},
	{ username: 'John Doe', type: 'Funding', createdAt: 0, 
		confirmedAt: 0, amount: 20, bank: 'Bank Of Country', bankAccount: '1G1C1G2343ER',
		status: 'Success', transactionId: 234223
	},
	{ username: 'John Doe', type: 'Funding', createdAt: 0, 
		confirmedAt: 0, amount: 20, bank: 'Bank Of Country', bankAccount: '1G1C1G2343ER',
		status: 'Success', transactionId: 234223
	},
	{ username: 'John Doe', type: 'Funding', createdAt: 0, 
		confirmedAt: 0, amount: 20, bank: 'Bank Of Country', bankAccount: '1G1C1G2343ER',
		status: 'Success', transactionId: 234223
	},
	{ username: 'John Doe', type: 'Funding', createdAt: 0, 
		confirmedAt: 0, amount: 20, bank: 'Bank Of Country', bankAccount: '1G1C1G2343ER',
		status: 'Pending', transactionId: 254343
	},
	{ username: 'John Doe', type: 'Funding', createdAt: 0, 
		confirmedAt: 0, amount: 20, bank: 'Bank Of Country', bankAccount: '1G1C1G2343ER',
		status: 'Pending', transactionId: 254343
	},
	{ username: 'John Doe', type: 'Funding', createdAt: 0, 
		confirmedAt: 0, amount: 20, bank: 'Bank Of Country', bankAccount: '1G1C1G2343ER',
		status: 'Pending', transactionId: 254343
	},
	{ username: 'John Doe', type: 'Funding', createdAt: 0, 
		confirmedAt: 0, amount: 20, bank: 'Bank Of Country', bankAccount: '1G1C1G2343ER',
		status: 'Pending', transactionId: 254343
	},
	{ username: 'John Doe', type: 'Redemption', createdAt: 0, 
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
		fromUser: 'John Doe',
		toUser: 'John Dog',
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
		fromUser: 'John Doe',
		toUser: 'John Dog',
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
		fromUser: 'John Doe',
		toUser: 'John Dog',
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
		fromUser: 'John Doe',
		toUser: 'John Dog',
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
		fromUser: 'John Doe',
		toUser: 'John Dog',
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
		fromUser: 'John Doe',
		toUser: 'John Dog',
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
		fromUser: 'John Doe',
		toUser: 'John Dog',
		status: 'Success',
		isToMerchant: 1,
		confirmedAt: 0,
		createdAt: 0,
	},
];