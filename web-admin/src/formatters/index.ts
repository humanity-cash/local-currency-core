import { OperatorData } from '../types';
import {
  AxiosPromiseResponse,
  IACHTransaction,
  ITransaction,
  IBlockchainTransaction,
} from "../types";

const formatTransactionValue = (value: number | string): string => {
  return String((Number(value) / 1000000000000000000).toFixed(2));
};

const formatTransaction = (tx: any): ITransaction => {
  return {
    transactionHash: tx.transactionHash,
      blockNumber: tx.blockNumber,
      timestamp: tx.timestamp * 1000,
      userId: tx.userId,
      operator: tx.operator,
      value: formatTransactionValue(tx.value),
  }
}

export const formatDeposits = (
  response: AxiosPromiseResponse<[]>
): IACHTransaction[] => {
  return response?.data?.map((tx: any) => {
    return {
      ...formatTransaction(tx),
      type: "Deposit"
    };
  });
};

export const formatWithdrawals = (
  response: AxiosPromiseResponse<[]>
): IACHTransaction[] => {
  return response?.data?.map((tx: any) => {
    return {
      ...formatTransaction(tx),
      type: "Withdraw"
    };
  });
};

export const formatOperators = (
  response: AxiosPromiseResponse<[]>
): OperatorData[] => {
  return response?.data?.map((data: any) => {
    return {
      operator: data.operator,
      operatorDisplayName: data.operatorDisplayName,
      totalDeposits: +data.totalDeposits,
      totalWithdrawals: +data.totalWithdrawals,
      currentOutstanding: +data.currentOutstanding,
      deposits: data.deposits.map((tx: any) => {
        return formatTransaction(tx)
      }),
      withdrawals: data.withdrawals.map((tx: any) => {
        return formatTransaction(tx)
      })
    };
  });
};

export const formatTransfers = (
  response: AxiosPromiseResponse<[]>
): IBlockchainTransaction[] => {
  return response?.data?.map((tx: any) => {
    return {
      fromUserId: tx.fromUserId,
      fromAddress: tx.fromAddress,
      toUserId: tx.toUserId,
      toAddress: tx.toAddress,
      value: formatTransactionValue(tx.value),
      transactionHash: tx.transactionHash,
      blockNumber: tx.blockNumber,
      timestamp: tx.timestamp * 1000,
      type: "Transfer",
    };
  });
};
