import { Request, Response } from "express";
import {
  getFundingStatus,
  getDeposits,
  getWithdrawals,
  getTransfers,
} from "src/service/PublicService";
import { httpUtils } from "src/utils";
import {
  IDeposit,
  IWithdrawal,
  IOperatorTotal,
  ITransferEvent,
} from "src/types";

const codes = httpUtils.codes;

export async function getAllDeposits(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const deposits: IDeposit[] = await getDeposits();
    httpUtils.createHttpResponse(deposits, codes.OK, res);
  } catch (err) {
    httpUtils.serverError(err, res);
  }
}

export async function getAllWithdrawals(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const withdrawals: IWithdrawal[] = await getWithdrawals();
    httpUtils.createHttpResponse(withdrawals, codes.OK, res);
  } catch (err) {
    httpUtils.serverError(err, res);
  }
}

export async function getOperatorStatistics(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const operatorStats: IOperatorTotal[] = await getFundingStatus();
    httpUtils.createHttpResponse(operatorStats, codes.OK, res);
  } catch (err) {
    httpUtils.serverError(err, res);
  }
}

export async function getAllTransfers(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const transfers: ITransferEvent[] = await getTransfers();
    httpUtils.createHttpResponse(transfers, codes.OK, res);
  } catch (err) {
    httpUtils.serverError(err, res);
  }
}
