import * as utils from "../utils/utils";
import * as Authorized from "../service/AuthorizedService";
import * as Public from "../service/PublicService";
import { Request, Response, NextFunction } from "express";

const codes = utils.codes;

export async function createUser(
  req: Request,
  res: Response,
  next?: NextFunction
): Promise<void> {
  try {
    console.log(req.body);
    const newUser = req.body;

    if (utils.validateAttributes(["userId"], newUser, res, "body")) {
      await Authorized.createUser(newUser);
      const user = await Public.getBeneficiary(newUser.userId);
      utils.createHttpResponse(user, codes.CREATED, res);
    }
  } catch (err) {
    console.error(err);

    if (err.message?.includes("ERR_USER_EXISTS"))
      utils.createHttpResponse(
        {
          message: "Could not create user, already exists",
        },
        codes.UNPROCESSABLE,
        res
      );
    else
      utils.createHttpResponse(
        {
          message: "Server error: " + err,
        },
        codes.SERVER_ERROR,
        res
      );
  }
}

export async function authorization(
  req: Request,
  res: Response,
  next?: NextFunction
): Promise<void> {
  try {
    const authorizationRequest = req.body;
    console.log(authorizationRequest);

    if (
      utils.validateAttributes(
        ["userId", "transactionId", "authorizationAmount"],
        authorizationRequest,
        res,
        "body"
      )
    ) {
      const response = await Authorized.authorization(authorizationRequest);
      console.log(response);
      res.status(codes.ACCEPTED).end();
    }
  } catch (err) {
    console.error(err);

    if (err.message?.includes("ERR_NO_BALANCE"))
      utils.createHttpResponse(
        {
          message:
            "Authorization unsuccessful, not enough balance to authorize",
        },
        codes.UNPROCESSABLE,
        res
      );
    else if (err.message?.includes("ERR_AUTH_EXISTS"))
      utils.createHttpResponse(
        {
          message:
            "Authorization unsuccessful, already exists for this transaction ID",
        },
        codes.UNPROCESSABLE,
        res
      );
    else if (err.message?.includes("ERR_ZERO_VALUE"))
      utils.createHttpResponse(
        {
          message: "Authorization unsuccessful, cannot authorize for zero",
        },
        codes.UNPROCESSABLE,
        res
      );
    else {
      utils.createHttpResponse(
        {
          message: "Server error: " + err,
        },
        codes.SERVER_ERROR,
        res
      );
    }
  }
}

export async function deleteAuthorization(
  req: Request,
  res: Response,
  next?: NextFunction
): Promise<void> {
  try {
    const deleteAuth = req.body;
    console.log(deleteAuth);

    if (
      utils.validateAttributes(
        ["transactionId", "userId"],
        deleteAuth,
        res,
        "body"
      )
    ) {
      const response = await Authorized.deleteAuthorization(
        deleteAuth.userId,
        deleteAuth.transactionId
      );
      console.log(response);
      res.status(codes.NO_CONTENT).end();
    }
  } catch (err) {
    console.error(err);
    utils.createHttpResponse(
      {
        message: "Server error: " + err,
      },
      codes.SERVER_ERROR,
      res
    );
  }
}

export async function settlement(
  req: Request,
  res: Response,
  next?: NextFunction
): Promise<void> {
  try {
    const settlementRequest = req.body;
    console.log(settlementRequest);

    if (
      utils.validateAttributes(
        ["userId", "transactionId", "settlementAmount"],
        settlementRequest,
        res,
        "body"
      )
    ) {
      const response = await Authorized.settlement(settlementRequest);
      console.log(response);
      res.status(codes.ACCEPTED).end();
    }
  } catch (err) {
    console.error(err);

    if (err.message?.includes("ERR_NO_BALANCE"))
      utils.createHttpResponse(
        {
          message: "Settlement unsuccessful, not enough balance to authorize",
        },
        codes.UNPROCESSABLE,
        res
      );
    else if (err.message?.includes("ERR_SETTLE_EXISTS"))
      utils.createHttpResponse(
        {
          message:
            "Settlement unsuccessful, already exists for this transaction ID",
        },
        codes.UNPROCESSABLE,
        res
      );
    else if (err.message?.includes("ERR_ZERO_VALUE"))
      utils.createHttpResponse(
        {
          message: "Settlement unsuccessful, cannot settle for zero",
        },
        codes.UNPROCESSABLE,
        res
      );
    else if (err.message?.includes("ERR_USER_NOT_EXIST"))
      utils.createHttpResponse(
        {
          message: "Settlement unsuccessful, user does not exist",
        },
        codes.UNPROCESSABLE,
        res
      );
    else {
      utils.createHttpResponse(
        {
          message: "Server error: " + err,
        },
        codes.SERVER_ERROR,
        res
      );
    }
  }
}
