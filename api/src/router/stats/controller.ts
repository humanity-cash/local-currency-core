import { Request, Response } from "express";
import * as PublicServices from "src/service/PublicService";
import {
  getFundingStatus,
  getDeposits,
  getWithdrawals,
  getTransfers,
} from "src/service/PublicService";
import { httpUtils } from "src/utils";
import {
  IDBUser,
  StatsUser,
  IDeposit,
  IWithdrawal,
  IOperatorTotal,
  ITransferEvent,
  IWallet,
} from "src/types";
import { UserService as UserDatabaseService } from "src/database/service";

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

export async function getUsersStats(
  req: Request,
  res: Response
): Promise<StatsUser[]> {
  try {
    const users: IDBUser[] = await UserDatabaseService.getAll();
    if (!users?.length) return [];
    const businesses: StatsUser[] = [];
    const customers: StatsUser[] = [];

    await Promise.all(
      users.map(async (u: IDBUser): Promise<StatsUser[]> => {
        if (u.verifiedBusiness) {
          const business = u.business;
          const walletData: IWallet = await PublicServices.getWallet(
            business.dwollaId
          );
          const user: StatsUser = {
            firstName: business.owner.firstName,
            lastName: business.owner.lastName,
            email: u.email,
            dwollaId: business.dwollaId,
            balance: walletData.availableBalance,
            lastLogin: 0,
            walletAddress: business.walletAddress,
            address: `${business.address1} ${business.address2}`,
            type: "business",
          };
          businesses.push(user);
        }
        if (u.verifiedCustomer) {
          const customer = u.customer;
          const walletData: IWallet = await PublicServices.getWallet(
            customer.dwollaId
          );
          const user: StatsUser = {
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: u.email,
            dwollaId: customer.dwollaId,
            balance: walletData.availableBalance,
            lastLogin: 0,
            walletAddress: customer.walletAddress,
            address: `${customer.address1} ${customer.address2}`,
            type: "customer",
          };
          customers.push(user);
        }
        return;
      })
    );

    const all = customers.concat(businesses);
    httpUtils.createHttpResponse(all, codes.OK, res);
  } catch (err) {
    httpUtils.serverError(err, res);
  }
}
