import { Request, Response } from "express";
import * as OperatorService from "src/service/OperatorService";
import * as PublicServices from "src/service/PublicService";
import { DwollaEvent } from "src/service/digital-banking/DwollaTypes";
import { consumeWebhook } from "src/service/digital-banking/Dwolla";
import { isDevelopment, isProduction, log } from "src/utils";
import {createDummyEvent} from "../../test/utils";

import {
  IDeposit,
  INewUser,
  INewUserResponse,
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
    httpUtils.serverError(err, res);
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
      httpUtils.notFound("Get user failed: user does not exist", res);
    else {
      httpUtils.serverError(err, res);
    }
  }
}

async function shortcutUserCreation(userId:string) : Promise<void>{
  if(isProduction())
    throw "Error! Development utility used in production"; 

  const event : DwollaEvent = createDummyEvent("customer_created", userId);  
  const created : boolean = await consumeWebhook(event); 

  if(created)
    log(`[NODE_ENV="development"] User ${userId} created with dummy webhook POST`);
  else
    log(`[NODE_ENV="development"] User ${userId} not created, check logs for details`);
}

export async function createUser(req: Request, res: Response): Promise<void> {
  try {
    
    const newUser: INewUser = req.body;
    const businessName : string = newUser.businessName || "";
    if(businessName)
      newUser.email = newUser.authUserId + "@humanity.cash";
      
    const newUserResponse : INewUserResponse = await OperatorService.createUser(newUser);

    if(isDevelopment()){
      log(`[NODE_ENV="developent"] Performing webhook shortcut...`);
      await shortcutUserCreation(newUserResponse.userId);
    }
    else{
      log(`[NODE_ENV!="development"] Webhook will create user on-chain...`);
    }

    httpUtils.createHttpResponse(
      newUserResponse,
      codes.CREATED,
      res
    );
    
  } catch (err) {
    if (err.message?.includes("ERR_USER_EXISTS"))
      httpUtils.unprocessable("Create user failed: user already exists", res);
    else httpUtils.serverError(err, res);
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
      httpUtils.notFound("Deposit failed: user does not exist", res);
    else if (err?.message?.includes("ERR_ZERO_VALUE"))
      httpUtils.unprocessable("Deposit failed: cannot deposit zero", res);
    else if (err?.message?.includes("INVALID_ARGUMENT"))
      httpUtils.unprocessable(
        "Transfer failed: invalid argument (probably a Web3 type error, negative number passed as uint256)",
        res
      );
    else httpUtils.serverError(err, res);
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
      httpUtils.notFound("Get deposits failed: user does not exist", res);
    else httpUtils.serverError(err, res);
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
      httpUtils.notFound("Get withdrawals failed: user does not exist", res);
    else httpUtils.serverError(err, res);
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
      httpUtils.notFound("Get transfers failed: user does not exist", res);
    else httpUtils.serverError(err, res);
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
      httpUtils.notFound("Withdrawal failed: user does not exist", res);
    else if (err?.message?.includes("ERR_ZERO_VALUE"))
      httpUtils.unprocessable("Withdrawal failed: cannot withdraw zero", res);
    else if (err?.message?.includes("ERR_NO_BALANCE"))
      httpUtils.unprocessable(
        "Withdrawal failed: cannot withdraw more than your balance",
        res
      );
    else if (err?.message?.includes("INVALID_ARGUMENT"))
      httpUtils.unprocessable(
        "Transfer failed: invalid argument (probably a Web3 type error, e.g. negative number passed as uint256)",
        res
      );
    else httpUtils.serverError(err, res);
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
      httpUtils.notFound("Transfer failed: user does not exist", res);
    else if (err?.message?.includes("ERR_ZERO_VALUE"))
      httpUtils.unprocessable("Transfer failed: cannot transfer zero", res);
    else if (err?.message?.includes("ERR_NO_BALANCE"))
      httpUtils.unprocessable(
        "Transfer failed: cannot transfer more than your balance",
        res
      );
    else if (err?.message?.includes("INVALID_ARGUMENT"))
      httpUtils.unprocessable(
        "Transfer failed: invalid argument (probably a Web3 type error, negative number passed as uint256)",
        res
      );
    else httpUtils.serverError(err, res);
  }
}
