import { AxiosPromiseResponse, ITransaction } from '../types';

const formatTransactionValue = (value: number | string): string => {
	return String((Number(value) / 1000000000000000000).toFixed(2))
}

export const formatDeposits = (response: AxiosPromiseResponse<[]>): ITransaction[] => {
	return response?.data?.map((tx: any) => {
		return {
			transactionHash: tx.transactionHash,
			blockNumber: tx.blockNumber,
			timestamp: tx.timestamp * 1000,
			userId: tx.userId,
			type: "Deposit",
			operator: tx.operator,
			value: formatTransactionValue(tx.value)
		}
	})
}

export const formatWithdrawals = (response: AxiosPromiseResponse<[]>): ITransaction[] => {
	return response?.data?.map((tx: any) => {
		return {
			transactionHash: tx.transactionHash,
			blockNumber: tx.blockNumber,
			timestamp: tx.timestamp * 1000,
			userId: tx.userId,
			operator: tx.operator,
			type: "Withdraw",
			value: formatTransactionValue(tx.value)
		}
	})
}

export const formatTransfers = (response: AxiosPromiseResponse<[]>): ITransaction[] => {
	return response?.data?.map((tx: any) => {
		return {
			transactionHash: tx.transactionHash,
			blockNumber: tx.blockNumber,
			timestamp: tx.timestamp * 1000,
			userId: tx.userId,
			operator: tx.operator,
			type: tx.value > 0 ? "Transfer In" : "Transfer Out",
			value: formatTransactionValue(tx.value)
		}
	})
}