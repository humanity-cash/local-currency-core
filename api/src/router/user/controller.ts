import { Request, Response } from "express";
import * as AuthroizedServices from "src/service/AuthorizedService";
import * as PublicServices from "src/service/PublicService";
import { httpUtils } from "src/utils";

const codes = httpUtils.codes;

export async function getAllUsers(_req: Request, res: Response): Promise<void> {
  try {
    const users = await PublicServices.getAllWallets();
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
    const user = await PublicServices.getWallet(id);
    // Create as an array of one item for API consistency
    httpUtils.createHttpResponse([user], codes.OK, res);
  } catch (err) {
    console.error(err);

    if (err.message && err.message.includes("ERR_USER_NOT_EXIST"))
      httpUtils.createHttpResponse(
        {
          message: "User does not exist",
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
    const newUser = req.body;
    await AuthroizedServices.createUser(newUser);
    const user = await PublicServices.getWallet(newUser.userId);
    httpUtils.createHttpResponse(user, codes.CREATED, res);
  } catch (err) {
    console.error(err);

    if (err.message?.includes("ERR_USER_EXISTS"))
      httpUtils.createHttpResponse(
        {
          message: "Could not create user, already exists",
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

export async function getAllUsersSettlements(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    const users = await PublicServices.getAllWallets();
    const addresses = await Promise.all(
      users.map(({ userId }) => PublicServices.getWalletAddress(userId))
    );
    const settlements = await Promise.all(
      addresses.map((address) =>
        PublicServices.getSettlementsForAddress(address)
      )
    );
    httpUtils.createHttpResponse(settlements, codes.OK, res);
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

export async function getUserSettlements(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId: string = req?.params?.id;
    const address = await PublicServices.getWalletAddress(userId);
    const settlements = await PublicServices.getSettlementsForAddress(address);
    httpUtils.createHttpResponse(settlements, codes.OK, res);
  } catch (err) {
    if (err.message && err.message.includes("ERR_USER_NOT_EXIST"))
      httpUtils.createHttpResponse(
        {
          message: "User does not exist",
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

export async function createSettlementForUser(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const settlementRequest = req.body;
    console.log(settlementRequest);
    const response = await AuthroizedServices.settlement(settlementRequest);
    console.log(response);
    res.status(codes.ACCEPTED).end();
  } catch (err) {
    console.error(err);

    if (err.message?.includes("ERR_NO_BALANCE"))
      httpUtils.createHttpResponse(
        {
          message: "Settlement unsuccessful, not enough balance to authorize",
        },
        codes.UNPROCESSABLE,
        res
      );
    else if (err.message?.includes("ERR_SETTLE_EXISTS"))
      httpUtils.createHttpResponse(
        {
          message:
            "Settlement unsuccessful, already exists for this transaction ID",
        },
        codes.UNPROCESSABLE,
        res
      );
    else if (err.message?.includes("ERR_ZERO_VALUE"))
      httpUtils.createHttpResponse(
        {
          message: "Settlement unsuccessful, cannot settle for zero",
        },
        codes.UNPROCESSABLE,
        res
      );
    else if (err.message?.includes("ERR_USER_NOT_EXIST"))
      httpUtils.createHttpResponse(
        {
          message: "Settlement unsuccessful, user does not exist",
        },
        codes.UNPROCESSABLE,
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
