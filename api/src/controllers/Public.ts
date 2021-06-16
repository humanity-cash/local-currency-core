import * as utils from "../utils/utils";
import * as Public from "../service/PublicService";
import { Request, Response } from "express";
const codes = utils.codes;

export async function getAllUsers(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const users = await Public.getAllBeneficiaries();
    utils.createHttpResponse(users, codes.OK, res);
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

export async function getUser(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const params = req.query;
    console.log("params", params);

    if (params.userId) {
      const user = await Public.getBeneficiary(params.userId);
      // Create as an array of one item for API consistency
      utils.createHttpResponse([user], codes.OK, res);
    } else {
      utils.createHttpResponse({message: "No userId was provided!"}, codes.BAD_REQUEST, res);
    }
  } catch (err) {
    console.error(err);

    if (err.message && err.message.includes("ERR_USER_NOT_EXIST"))
      utils.createHttpResponse(
        {
          message: "User does not exist",
        },
        codes.NOT_FOUND,
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

export async function health(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const response = await Public.health();
    utils.createHttpResponse(response, codes.OK, res);
  } catch (err) {
    console.error(err);
    utils.createHttpResponse({ message: "Server error: " + err }, 500, res);
  }
}

export async function getSettlements(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const params = req.query;
    console.log(params);

    if (utils.validateAttributes(["userId"], params, res, "parameters")) {
      const address = await Public.beneficiaryAddress(params.userId);
      const settlements = await Public.getSettlementsForAddress(address);
      utils.createHttpResponse(settlements, codes.OK, res);
    }
  } catch (err) {
    console.error(err);

    if (err.message && err.message.includes("ERR_USER_NOT_EXIST"))
      utils.createHttpResponse(
        {
          message: "User does not exist",
        },
        codes.NOT_FOUND,
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

export async function getAuthorizations(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const params = req.query;
    console.log(params);

    if (utils.validateAttributes(["userId"], params, res, "parameters")) {
      const address = await Public.beneficiaryAddress(params.userId);
      const authorizations = await Public.getAuthorizationsForAddress(address);
      utils.createHttpResponse(authorizations, codes.OK, res);
    }
  } catch (err) {
    console.error(err);

    if (err.message && err.message.includes("ERR_USER_NOT_EXIST"))
      utils.createHttpResponse(
        {
          message: "User does not exist",
        },
        codes.NOT_FOUND,
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
