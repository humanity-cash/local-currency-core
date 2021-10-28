import * as dwolla from "dwolla-v2";
import { Request, Response } from "express";
import { AppNotificationService } from "src/database/service";
import * as AuthService from "src/service/AuthService";
import { getFundingSourcesById, getIAVTokenById } from "src/service/digital-banking/DwollaService";
import { DwollaEvent } from "src/service/digital-banking/DwollaTypes";
import { consumeWebhook } from "src/service/digital-banking/DwollaWebhookService";
import * as OperatorService from "src/service/OperatorService";
import * as PublicServices from "src/service/PublicService";
import {
  BusinessDetails,
  CustomerDetails,
  IAddBusinessVerification,
  IAddCustomerVerification,
  IBusinessDowllaId,
  ICustomerDowllaId,
  IDeposit,
  IDowllaNewUser,
  INewUser,
  INewUserResponse,
  ITransferEvent,
  IWallet,
  IWithdrawal
} from "src/types";
import { httpUtils, isDevelopment, isProduction, log } from "src/utils";
import { createDummyEvent } from "../../test/utils";


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

export async function getNotifications(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const id = req?.params?.id;
    const notifications: AppNotificationService.IAppNotificationDBItem[] =
      await AppNotificationService.findByUserId(id);
    notifications?.sort((a, b) => { return a.timestamp - b.timestamp });
    httpUtils.createHttpResponse(notifications || [], codes.OK, res);
  } catch (err) {
    if (err?.message?.includes("ERR_USER_NOT_EXIST"))
      httpUtils.notFound("Get deposits failed: user does not exist", res);
    else httpUtils.serverError(err, res);
  }
}

export async function closeNotification(
  req: Request,
  res: Response
): Promise<void> {
  try {
    // const id = req?.params?.id;
    const dbId = req?.params?.notificationId;
    const closed: boolean = await AppNotificationService.close(dbId);
    httpUtils.createHttpResponse(
      { message: `Notification closed: ${closed}` },
      codes.OK,
      res
    );
  } catch (err) {
    if (err?.message?.includes("ERR_USER_NOT_EXIST"))
      httpUtils.notFound("Get deposits failed: user does not exist", res);
    else httpUtils.serverError(err, res);
  }
}

export async function getFundingSources(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const id = req?.params?.id;
    // Get wallet simply to check if user exists
    await PublicServices.getWallet(id);
    const fundingSources: dwolla.Response = await getFundingSourcesById(id);
    httpUtils.createHttpResponse(fundingSources, codes.OK, res);
  } catch (err) {
    if (err.message && err.message.includes("ERR_USER_NOT_EXIST"))
      httpUtils.notFound("Get user failed: user does not exist", res);
    else {
      httpUtils.serverError(err, res);
    }
  }
}

export async function getIAVToken(req: Request, res: Response): Promise<void> {
  try {
    const id = req?.params?.id;
    // Get wallet simply to check if user exists
    await PublicServices.getWallet(id);
    const iavToken: string = await getIAVTokenById(id);
    httpUtils.createHttpResponse({ iavToken: iavToken }, codes.OK, res);
  } catch (err) {
    if (err.message && err.message.includes("ERR_USER_NOT_EXIST"))
      httpUtils.notFound("Get user failed: user does not exist", res);
    else {
      httpUtils.serverError(err, res);
    }
  }
}

async function shortcutUserCreation(userId: string): Promise<void> {
  if (isProduction()) throw "Error! Development utility used in production";

  const event: DwollaEvent = createDummyEvent(
    "customer_created",
    userId,
    userId
  );
  const created: boolean = await consumeWebhook(event);

  if (created)
    log(
      `[NODE_ENV="development"] User ${userId} created with dummy webhook POST`
    );
  else
    log(
      `[NODE_ENV="development"] User ${userId} not created, check logs for details`
    );
}

function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
};

export function isEmptyObject(i: unknown): boolean {
  if (!i || !isObject(i)) return true
  const keys = Object.keys(i);

  return Boolean(keys.length);
}

export async function createUser(req: Request, res: Response): Promise<void> {
  try {
    const newUser: INewUser = req.body;
    const newUserResponse: INewUserResponse = await OperatorService.createUser(
      newUser.dowllaDetails
    );
    const isCustomer = () => newUser?.customerDetails && !isEmptyObject(newUser?.customerDetails);
    const isBusiness = () => newUser?.businessDetails && !isEmptyObject(newUser?.businessDetails);
    let result = {}; //new user created in db

    if (isCustomer) {
      result = await AuthService.createCustomer({
        consent: true,
        customer: {
          ...newUser.customerDetails,
          dowllaId: newUserResponse.userId,
          resourceUri: newUserResponse.resourceUri
        },
        email: newUser.email,
      })
    } else if (isBusiness) {
      result = await AuthService.createBusiness({
        consent: true,
        business: {
          ...newUser.businessDetails,
          dowllaId: newUserResponse.userId,
          resourceUri: newUserResponse.resourceUri
        },
        email: newUser.email,
      })
    }

    if (isDevelopment()) {
      log(`[NODE_ENV="development"] Performing webhook shortcut...`);
      await shortcutUserCreation(newUserResponse.userId);
    } else {
      log(`[NODE_ENV!="development"] Webhook will create user on-chain...`);
    }

    httpUtils.createHttpResponse(result, codes.CREATED, res);
  } catch (err) {
    if (err.message?.includes("ERR_USER_EXISTS"))
      httpUtils.unprocessable("Create user failed: user already exists", res);
    else httpUtils.serverError(err, res);
  }
}

export async function addCustomerVerification(req: Request, res: Response): Promise<void> {
  try {
    const { customer, filter }: { customer: CustomerDetails, filter: IBusinessDowllaId } = req.body;
    const { firstName, lastName, city, state, postalCode, address1, address2, avatar, tag } = customer;
    const dowllaDetails: IDowllaNewUser = {
      email: 'email@email.com', //?
      authUserId: '', // ?
      firstName,
      lastName,
      city,
      state,
      postalCode,
      address1,
      address2,
      ipAddress: '',
      rbn: '',
    }

    const newUserResponse: INewUserResponse = await OperatorService.createUser(
      dowllaDetails
    );
    
    const customerVerification: IAddCustomerVerification = {
      customer: {
        avatar,
        tag,
        address1,
        address2,
        city,
        state,
        postalCode,
        firstName,
        lastName,
        dowllaId: newUserResponse.userId,
        resourceUri: newUserResponse.resourceUri,
      }
    };

    const result = await AuthService.addCustomerVerification(filter.business.dowllaId, customerVerification);

    if (isDevelopment()) {
      log(`[NODE_ENV="development"] Performing webhook shortcut...`);
      await shortcutUserCreation(newUserResponse.userId);
    } else {
      log(`[NODE_ENV!="development"] Webhook will create user on-chain...`);
    }

    httpUtils.createHttpResponse(result, codes.CREATED, res);
  } catch (err) {
    if (err.message?.includes("ERR_USER_EXISTS"))
      httpUtils.unprocessable("Create user failed: user already exists", res);
    else httpUtils.serverError(err, res);
  }
}

export async function addBusinessVerification(req: Request, res: Response): Promise<void> {
  try {
    const { business, filter }: { business: BusinessDetails, filter: ICustomerDowllaId } = req.body;
    const { story, owner, rbn, ein, city, state, postalCode, address1, address2, avatar, tag, type,
      industry,
      phoneNumber, } = business;
    const dowllaDetails: IDowllaNewUser = {
      email: 'email@email.com', //?
      authUserId: '', // ?
      firstName: owner.firstName,
      lastName: owner.lastName,
      city,
      state,
      postalCode,
      address1,
      address2,
      ipAddress: '',
      rbn,
    }

    const newUserResponse: INewUserResponse = await OperatorService.createUser(
      dowllaDetails
    );
    const businessVerification: IAddBusinessVerification = {
      business: {
        story,
        tag,
        rbn,
        owner,
        avatar,
        type,
        industry,
        phoneNumber,
        ein,
        address1,
        address2,
        city,
        state,
        postalCode,
        dowllaId: newUserResponse.userId,
        resourceUri: newUserResponse.resourceUri,
      }
    };
    const result = await AuthService.addBusinessVerification(filter.customer.dowllaId, businessVerification);

    if (isDevelopment()) {
      log(`[NODE_ENV="development"] Performing webhook shortcut...`);
      await shortcutUserCreation(newUserResponse.userId);
    } else {
      log(`[NODE_ENV!="development"] Webhook will create user on-chain...`);
    }

    httpUtils.createHttpResponse(result, codes.CREATED, res);
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
    const wallet: IWallet = await PublicServices.getWallet(id);
    await OperatorService.deposit(id, deposit.amount);
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

// const businessName: string = newUser.businessName || "";
// if (businessName) newUser.email = newUser.authUserId + "@humanity.cash";