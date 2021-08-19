import { Request, Response } from "express";
import * as OperatorService from "src/service/OperatorService";
import * as PublicServices from "src/service/PublicService";
import {
  IDeposit,
  INewUser,
  ITransferEvent,
  IWallet,
  IWithdrawal,
} from "src/types";
import { httpUtils } from "src/utils";

const codes = httpUtils.codes;

export async function getAllUsers(_req: Request, res: Response): Promise<void> {
  try {
    const users: IWallet[] = await PublicServices.getAllWallets();
    httpUtils.createHttpResponse(users, codes.OK, res);
  } catch (err) {
    httpUtils.createHttpResponse(
      {
        message: "Server error: " + err,
      },
      codes.SERVER_ERROR,
      res
    );
  }
}

export async function getUser(req: Request, res: Response): Promise<void> {
  try {
    const id = req?.params?.id;
    const user: IWallet = await PublicServices.getWallet(id);
    // Create as an array of one item for API consistency
    httpUtils.createHttpResponse([user], codes.OK, res);
  } catch (err) {
    if (err.message && err.message.includes("ERR_USER_NOT_EXIST"))
      httpUtils.createHttpResponse(
        {
          message: "Get user failed: user does not exist",
        },
        codes.NOT_FOUND,
        res
      );
    else {
      httpUtils.createHttpResponse(
        {
          message: "Server error: " + err,
        },
        codes.SERVER_ERROR,
        res
      );
    }
  }
}

export async function createUser(req: Request, res: Response): Promise<void> {
  try {
    const newUser: INewUser = req.body;
    await OperatorService.createUser(newUser);
    const wallet: IWallet = await PublicServices.getWallet(newUser.userId);
    httpUtils.createHttpResponse(wallet, codes.CREATED, res);
  } catch (err) {
    if (err.message?.includes("ERR_USER_EXISTS"))
      httpUtils.createHttpResponse(
        {
          message: "Create user failed: user already exists",
        },
        codes.UNPROCESSABLE,
        res
      );
    else
      httpUtils.createHttpResponse(
        {
          message: "Server error: " + err,
        },
        codes.SERVER_ERROR,
        res
      );
  }
}

export async function deposit(req: Request, res: Response): Promise<void> {
  try {
    const id = req?.params?.id;
    const deposit = req.body;
    await OperatorService.deposit(id, deposit.amount);
    const wallet: IWallet = await PublicServices.getWallet(id);
    httpUtils.createHttpResponse(wallet, codes.ACCEPTED, res);
  } catch (err) {
    if (err?.message?.includes("ERR_USER_NOT_EXIST"))
      httpUtils.createHttpResponse(
        {
          message: "Deposit failed: user does not exist",
        },
        codes.UNPROCESSABLE,
        res
      );
    else if (err?.message?.includes("ERR_ZERO_VALUE"))
      httpUtils.createHttpResponse(
        {
          message: "Deposit failed: cannot deposit zero",
        },
        codes.UNPROCESSABLE,
        res
      );
    else if (err?.message?.includes("INVALID_ARGUMENT"))
      httpUtils.createHttpResponse(
        {
          message:
            "Transfer failed: invalid argument (probably a Web3 type error, negative number passed as uint256)",
        },
        codes.UNPROCESSABLE,
        res
      );
    else
      httpUtils.createHttpResponse(
        {
          message: "Server error: " + err,
        },
        codes.SERVER_ERROR,
        res
      );
  }
}

export async function getDeposits(req: Request, res: Response): Promise<void> {
  try {
    const id = req?.params?.id;
    await PublicServices.getWallet(id);
    const deposits: IDeposit[] = await OperatorService.getDepositsForUser(id);
    httpUtils.createHttpResponse(deposits, codes.OK, res);
  } catch (err) {
    if (err?.message?.includes("ERR_USER_NOT_EXIST"))
      httpUtils.createHttpResponse(
        {
          message: "Get deposits failed: user does not exist",
        },
        codes.UNPROCESSABLE,
        res
      );
    else
      httpUtils.createHttpResponse(
        {
          message: "Server error: " + err,
        },
        codes.SERVER_ERROR,
        res
      );
  }
}

export async function getWithdrawals(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const id = req?.params?.id;
    await PublicServices.getWallet(id);
    const withdrawals: IWithdrawal[] =
      await OperatorService.getWithdrawalsForUser(id);
    httpUtils.createHttpResponse(withdrawals, codes.OK, res);
  } catch (err) {
    if (err?.message?.includes("ERR_USER_NOT_EXIST"))
      httpUtils.createHttpResponse(
        {
          message: "Get withdrawals failed: user does not exist",
        },
        codes.UNPROCESSABLE,
        res
      );
    else
      httpUtils.createHttpResponse(
        {
          message: "Server error: " + err,
        },
        codes.SERVER_ERROR,
        res
      );
  }
}

export async function getTransfers(req: Request, res: Response): Promise<void> {
  try {
    const id = req?.params?.id;
    const transfers: ITransferEvent[] =
      await OperatorService.getTransfersForUser(id);
    httpUtils.createHttpResponse(transfers, codes.OK, res);
  } catch (err) {
    if (err?.message?.includes("ERR_USER_NOT_EXIST"))
      httpUtils.createHttpResponse(
        {
          message: "Get transfers failed: user does not exist",
        },
        codes.UNPROCESSABLE,
        res
      );
    else
      httpUtils.createHttpResponse(
        {
          message: "Server error: " + err,
        },
        codes.SERVER_ERROR,
        res
      );
  }
}

export async function withdraw(req: Request, res: Response): Promise<void> {
  try {
    const id = req?.params?.id;
    const withdrawal = req.body;
    await OperatorService.withdraw(id, withdrawal.amount);
    const wallet: IWallet = await PublicServices.getWallet(id);
    httpUtils.createHttpResponse(wallet, codes.ACCEPTED, res);
  } catch (err) {
    if (err?.message?.includes("ERR_USER_NOT_EXIST"))
      httpUtils.createHttpResponse(
        {
          message: "Withdrawal failed: user does not exist",
        },
        codes.UNPROCESSABLE,
        res
      );
    else if (err?.message?.includes("ERR_ZERO_VALUE"))
      httpUtils.createHttpResponse(
        {
          message: "Withdrawal failed: cannot withdraw zero",
        },
        codes.UNPROCESSABLE,
        res
      );
    else if (err?.message?.includes("ERR_NO_BALANCE"))
      httpUtils.createHttpResponse(
        {
          message: "Withdrawal failed: cannot withdraw more than your balance",
        },
        codes.UNPROCESSABLE,
        res
      );
    else if (err?.message?.includes("INVALID_ARGUMENT"))
      httpUtils.createHttpResponse(
        {
          message:
            "Transfer failed: invalid argument (probably a Web3 type error, e.g. negative number passed as uint256)",
        },
        codes.UNPROCESSABLE,
        res
      );
    else
      httpUtils.createHttpResponse(
        {
          message: "Server error: " + err,
        },
        codes.SERVER_ERROR,
        res
      );
  }
}

export async function transferTo(req: Request, res: Response): Promise<void> {
  try {
    const id = req?.params?.id;
    const transfer = req.body;
    await OperatorService.transferTo(id, transfer.toUserId, transfer.amount);
    const user: IWallet = await PublicServices.getWallet(id);
    httpUtils.createHttpResponse(user, codes.ACCEPTED, res);
  } catch (err) {
    if (err?.message?.includes("ERR_USER_NOT_EXIST"))
      httpUtils.createHttpResponse(
        {
          message: "Transfer failed: user does not exist",
        },
        codes.UNPROCESSABLE,
        res
      );
    else if (err?.message?.includes("ERR_ZERO_VALUE"))
      httpUtils.createHttpResponse(
        {
          message: "Transfer failed: cannot transfer zero",
        },
        codes.UNPROCESSABLE,
        res
      );
    else if (err?.message?.includes("ERR_NO_BALANCE"))
      httpUtils.createHttpResponse(
        {
          message: "Transfer failed: cannot transfer more than your balance",
        },
        codes.UNPROCESSABLE,
        res
      );
    else if (err?.message?.includes("INVALID_ARGUMENT"))
      httpUtils.createHttpResponse(
        {
          message:
            "Transfer failed: invalid argument (probably a Web3 type error, negative number passed as uint256)",
        },
        codes.UNPROCESSABLE,
        res
      );
    else
      httpUtils.createHttpResponse(
        {
          message: "Server error: " + err,
        },
        codes.SERVER_ERROR,
        res
      );
  }
}
