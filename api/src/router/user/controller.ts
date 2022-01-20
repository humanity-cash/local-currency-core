import * as dwolla from "dwolla-v2";
import { uploadFileToBucket } from "src/aws";
import { Request, Response } from "express";
import { AppNotificationService } from "src/database/service";
import * as AuthService from "src/service/AuthService";
import {
  getFundingSourcesById,
  getIAVTokenById,
} from "src/service/digital-banking/DwollaService";
import { DwollaEvent } from "src/service/digital-banking/DwollaTypes";
import { consumeWebhook } from "src/service/digital-banking/DwollaWebhookService";
import * as OperatorService from "src/service/OperatorService";
import * as PublicServices from "src/service/PublicService";
import {
  Business,
  Customer,
  IAPINewUser,
  IDeposit,
  IDwollaNewUserInput,
  IDwollaNewUserResponse,
  ITransferEvent,
  IWallet,
  IWithdrawal,
} from "src/types";
import {
  dwollaUtils,
  httpUtils,
  isDwollaProduction,
  log,
  shouldSimulateWebhook,
} from "src/utils";
import { createDummyEvent } from "../../test/utils";
import { serverError } from "src/utils/http";

export const PROFILE_PICTURES_BUCKET = "profile-picture-user";
const codes = httpUtils.codes;

export async function getAllUsers(_req: Request, res: Response): Promise<void> {
  try {
    const users: IWallet[] = await PublicServices.getAllWallets();
    httpUtils.createHttpResponse(users, codes.OK, res);
  } catch (err) {
    httpUtils.serverError(err, res);
  }
}

export async function getUserByEmail(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const email = req?.params?.email;
    const dbUser = await AuthService.getUserByEmail(email);
    httpUtils.createHttpResponse([dbUser.data], codes.OK, res);
  } catch (err) {
    if (err.message && err.message.includes("ERR_USER_NOT_EXIST"))
      httpUtils.notFound("Get user failed: user does not exist", res);
    else {
      httpUtils.serverError(err, res);
    }
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
    const includeClosed = req?.query?.includeClosed;

    let notifications: AppNotificationService.IAppNotificationDBItem[];
    if (!includeClosed)
      notifications = await AppNotificationService.findOpenByUserId(id);
    else notifications = await AppNotificationService.findAllByUserId(id);

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

export async function createUser(req: Request, res: Response): Promise<void> {
  try {
    const newUserInput: IAPINewUser = req.body;
    const { customer, business, email, type } = newUserInput;

    if (!customer && !business)
      httpUtils.createHttpResponse({}, codes.BAD_REQUEST, res);

    log(newUserInput);

    const createDbResponse = await AuthService.createUser(
      { customer, business, email, consent: true },
      type
    );
    const dwollaDetails: IDwollaNewUserInput =
      dwollaUtils.constructCreateUserInput(createDbResponse.data, type, true);
    const newUserResponse: IDwollaNewUserResponse =
      await OperatorService.createUser(dwollaDetails);

    const updateResponse = await AuthService.updateDwollaDetails(
      createDbResponse.data.dbId,
      {
        dwollaId: newUserResponse.userId,
        resourceUri: newUserResponse.resourceUri,
      },
      type
    );

    if (shouldSimulateWebhook()) {
      log(`Simulating webhook for user creation...`);
      await shortcutUserCreation(newUserResponse.userId);
    } else {
      log(`Webhook will create user on-chain...`);
    }

    httpUtils.createHttpResponse(updateResponse.data, codes.CREATED, res);
  } catch (err) {
    if (err.message?.includes("ERR_USER_EXISTS"))
      httpUtils.unprocessable("Create user failed: user already exists", res);
    else httpUtils.serverError(err, res);
  }
}

export async function updateCustomerProfile(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const customer: Pick<Customer, "tag"> = req?.body?.customer;
    const customerDwollaId = req?.params?.id;
    const dbUser = await AuthService.updateCustomerProfile({
      customerDwollaId,
      update: { tag: customer.tag },
    });

    httpUtils.createHttpResponse(dbUser, codes.OK, res);
  } catch (err) {
    httpUtils.serverError(err, res);
  }
}

export async function updateBusinessProfile(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const business: Pick<
      Business,
      | "tag"
      | "story"
      | "address1"
      | "address2"
      | "phoneNumber"
      | "city"
      | "website"
      | "postalCode"
      | "state"
    > = req?.body?.business;
    const businessDwollaId = req?.params?.id;
    const dbUser = await AuthService.updateBusinessProfile({
      businessDwollaId,
      update: {
        tag: business.tag,
        story: business.story,
        address1: business.address1,
        address2: business.address2,
        city: business.city,
        postalCode: business.postalCode,
        state: business.state,
        website: business.website,
        phoneNumber: business.phoneNumber,
      },
    });

    httpUtils.createHttpResponse(dbUser, codes.OK, res);
  } catch (err) {
    httpUtils.serverError(err, res);
  }
}

export async function addCustomer(req: Request, res: Response): Promise<void> {
  try {
    const customer: Omit<Customer, "resourceUri" | "dwollaId"> =
      req?.body?.customer;
    const businessDwollaId = req?.params?.id;
    const dbUser = await AuthService.updateUser(businessDwollaId, { customer });
    const dwollaDetails = dwollaUtils.constructCreateUserInput(
      dbUser.data,
      "customer",
      false
    );
    const newUserResponse: IDwollaNewUserResponse =
      await OperatorService.createUser(dwollaDetails);
    const updateResponse = await AuthService.updateDwollaDetails(
      dbUser.data.dbId,
      {
        dwollaId: newUserResponse.userId,
        resourceUri: newUserResponse.resourceUri,
      },
      "customer"
    );

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
    const business: Omit<Business, "dwollaId" | "resourceUri"> =
      req?.body?.business;
    const customerDwollaId = req?.params?.id;
    const dbUser = await AuthService.updateUser(customerDwollaId, { business });
    const dwollaDetails = dwollaUtils.constructCreateUserInput(
      dbUser.data,
      "business",
      false
    );
    const newUserResponse: IDwollaNewUserResponse =
      await OperatorService.createUser(dwollaDetails);
    const updateResponse = await AuthService.updateDwollaDetails(
      dbUser.data.dbId,
      {
        dwollaId: newUserResponse.userId,
        resourceUri: newUserResponse.resourceUri,
      },
      "business"
    );
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
    if (deposits?.length > 0)
      httpUtils.createHttpResponse(deposits, codes.OK, res);
    else httpUtils.createHttpResponse([], codes.NO_CONTENT, res);
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
    if (withdrawals?.length > 0)
      httpUtils.createHttpResponse(withdrawals, codes.OK, res);
    else httpUtils.createHttpResponse([], codes.NO_CONTENT, res);
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
    if (transfers?.length > 0)
      httpUtils.createHttpResponse(transfers, codes.OK, res);
    else httpUtils.createHttpResponse([], codes.NO_CONTENT, res);
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

    // Get wallet
    const wallet: IWallet = await PublicServices.getWallet(id);

    // Business rule, individuals may only withdraw if their balance is not greater than 5.00
    const dbUser = await AuthService.getUser(id);

    if (dbUser.data.verifiedCustomer && dbUser.data.customer.dwollaId == id) {
      if (
        wallet.availableBalance >
        parseInt(process.env.CUSTOMER_WITHDRAWAL_BALANCE_LIMIT)
      ) {
        httpUtils.unprocessable(
          `Withdrawal failed: Only business accounts may withdraw when their balance is over $${parseInt(
            process.env.CUSTOMER_WITHDRAWAL_BALANCE_LIMIT
          )}`,
          res
        );
        return;
      }
    }

    // Perform withdrawal
    await OperatorService.withdraw(id, withdrawal.amount);
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
        "Withdrawal failed: invalid argument (probably a Web3 type error, e.g. negative number passed as uint256)",
        res
      );
    else httpUtils.serverError(err, res);
  }
}

export async function transferTo(req: Request, res: Response): Promise<void> {
  try {
    const id = req?.params?.id;
    const transfer = req.body;
    await OperatorService.transferTo(
      id,
      transfer.toUserId,
      transfer.amount,
      transfer.roundUpAmount
    );
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

export async function uploadProfilePicture(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId = req?.params?.id;
    const fileName = `${userId}-profile-picture.jpg`;
    const data: Buffer[] = [];
    req.on("data", (chunk: Buffer) => {
      data.push(chunk);
    });
    req.on("end", async () => {
      const stringData = Buffer.concat(data).toString(); //parse data
      const bufferData = Buffer.from(stringData, "base64"); //convert to buffer
      const uploadResponse = await uploadFileToBucket(
        PROFILE_PICTURES_BUCKET,
        fileName,
        bufferData
      );
      const updateResponse = await AuthService.updateUserProfilePicture(userId);
      httpUtils.createHttpResponse(
        { tag: uploadResponse.ETag, user: updateResponse.data },
        httpUtils.codes.OK,
        res
      );
    });
    req.on("err", (err) => {
      log(err);
      serverError(err, res);
    });
  } catch (err) {
    log(err);
    serverError(err, res);
    return;
  }
}
