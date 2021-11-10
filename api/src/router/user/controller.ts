import * as dwolla from "dwolla-v2";
import { Request, Response } from "express";
import { AppNotificationService } from "src/database/service";
import * as AuthService from "src/service/AuthService";
import { getFundingSourcesById, getIAVTokenById } from "src/service/digital-banking/DwollaService";
import { DwollaEvent } from "src/service/digital-banking/DwollaTypes";
import { consumeWebhook } from "src/service/digital-banking/DwollaWebhookService";
import * as OperatorService from "src/service/OperatorService";
import * as PublicServices from "src/service/PublicService";
import { isDwollaProduction, log, shouldSimulateWebhook, httpUtils } from "src/utils";
import { createDummyEvent } from "../../test/utils";

import {
  Business,
  Customer,
  IAPINewUser, IDBUser,
  IDeposit, IDwollaNewUserInput, IDwollaNewUserResponse, ITransferEvent,
  IWallet,
  IWithdrawal
} from "src/types";

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
    notifications?.sort((a, b) => {
      return a.timestamp - b.timestamp;
    });
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
    await AppNotificationService.close(dbId);
    httpUtils.createHttpResponse(
      { message: `Notification ${dbId} closed` },
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
  if (isDwollaProduction())
    throw Error("Development utility incorrectly used in production");

  const event: DwollaEvent = createDummyEvent(
    "customer_created",
    userId,
    userId
  );
  const created: boolean = await consumeWebhook(event);

  if (created) log(`User ${userId} created with dummy webhook...`);
  else log(`User ${userId} not created, check logs for details`);
}

function constructDwollaDetails(data: IDBUser, type: 'customer' | 'business', isNew: boolean) {
	const email = isNew ? data.email : `${data.dbId}@humanity.cash`;
	if (type === 'customer') {
		const dwollaDetails: IDwollaNewUserInput = {
			email,
			firstName: data.customer.firstName,
			lastName: data.customer.lastName,
			city: data.customer.city,
			state: data.customer.state,
			postalCode: data.customer.postalCode,
			address1: data.customer.address1,
			address2: data.customer.address2,
			correlationId: `customer-${data.dbId}`,
			ipAddress: ''
		}
		return dwollaDetails;
	} else if (type === 'business') {
		const dwollaDetails: IDwollaNewUserInput = {
			email,
			firstName: data.business.owner.firstName,
			lastName: data.business.owner.lastName,
			city: data.business.city,
			state: data.business.state,
			postalCode: data.business.postalCode,
			address1: data.business.address1,
			address2: data.business.address2,
      correlationId: `business-${data.dbId}`,
			rbn: data.business.rbn,
			ipAddress: '',
		}
		return dwollaDetails;
	}
}

export async function createUser(req: Request, res: Response): Promise<void> {
  try {
    const newUserInput: IAPINewUser = req.body;
    const { customer, business, email, type } = newUserInput
    if (!customer && !business) return httpUtils.createHttpResponse({}, codes.BAD_REQUEST, res)
    const createDbResponse = await AuthService.createUser({ customer, business, email, consent: true }, type);
    const dwollaDetails = constructDwollaDetails(createDbResponse.data, type, true);
    const newUserResponse: IDwollaNewUserResponse = await OperatorService.createUser(
      dwollaDetails
    );
    
    const updateResponse = await AuthService.updateDwollaDetails(createDbResponse.data.dbId,
      { dwollaId: newUserResponse.userId, resourceUri: newUserResponse.resourceUri }, type);
    if (shouldSimulateWebhook()) {
      log(`[NODE_ENV="development"] Performing webhook shortcut...`);
      
    if (shouldSimulateWebhook()) {
      log(`Simulating webhook for user creation...`);
      await shortcutUserCreation(newUserResponse.userId);
    } else {
      log(`Webhook will create user on-chain...`);
    }

    httpUtils.createHttpResponse(updateResponse.data, codes.CREATED, res);
    }
  } catch (err) {
    if (err.message?.includes("ERR_USER_EXISTS"))
      httpUtils.unprocessable("Create user failed: user already exists", res);
    else httpUtils.serverError(err, res);
  }
}

export async function addCustomer(req: Request, res: Response): Promise<void> {
  try {
    const customer: Omit<Customer, 'resourceUri' | 'dwollaId'> = req?.body?.customer;
    const businessDwollaId = req?.params?.id;
    const dbUser = await AuthService.updateUser(businessDwollaId, { customer }, 'business');
    const dwollaDetails = constructDwollaDetails(dbUser.data, 'customer', false);
    const newUserResponse: IDwollaNewUserResponse = await OperatorService.createUser(
      dwollaDetails
    );
    const updateResponse = await AuthService.updateDwollaDetails(dbUser.data.dbId,
      { dwollaId: newUserResponse.userId, resourceUri: newUserResponse.resourceUri }, 'customer');

    if (shouldSimulateWebhook()) {
      log(`Simulating webhook for user creation...`);
      await shortcutUserCreation(newUserResponse.userId);
    } else {
      log(`Webhook will create user on-chain...`);
    }

    httpUtils.createHttpResponse(updateResponse, codes.CREATED, res);
  } catch (err) {
    if (err.message?.includes("ERR_USER_EXISTS"))
      httpUtils.unprocessable("Create user failed: user already exists", res);
    else httpUtils.serverError(err, res);
  }
}

export async function addBusiness(req: Request, res: Response): Promise<void> {
  try {
    const business: Omit<Business, 'dwollaId' | 'resourceUri'> = req?.body?.business;
    const customerDwollaId = req?.params?.id;
    const dbUser = await AuthService.updateUser(customerDwollaId, { business }, 'customer');
    const dwollaDetails = constructDwollaDetails(dbUser.data, 'business', false);
    const newUserResponse: IDwollaNewUserResponse = await OperatorService.createUser(
      dwollaDetails
    );
    const updateResponse = await AuthService.updateDwollaDetails(dbUser.data.dbId,
      { dwollaId: newUserResponse.userId, resourceUri: newUserResponse.resourceUri }, 'business');
    if (shouldSimulateWebhook()) {
      log(`Simulating webhook for user creation...`);
      await shortcutUserCreation(newUserResponse.userId);
    } else {
      log(`Webhook will create user on-chain...`);
    }

    httpUtils.createHttpResponse(updateResponse, codes.CREATED, res);
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
