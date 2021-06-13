import { Request, Response } from "express";

import {httpUtils} from "src/utils";
import * as PublicServices from "src/service/PublicService";
import * as AuthroizedServices from "src/service/AuthorizedService";

const codes = httpUtils.codes;

const mockGetAllUserIds = () => ([]) 

export async function getAllSettlements(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const userIds = await mockGetAllUserIds()
		const addresses = await Promise.all(userIds.map(userId => PublicServices.beneficiaryAddress(userId)));
		const settlements = await Promise.all(addresses.map(address => PublicServices.getSettlementsForAddress(address)));
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

export async function getSettlements(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const userId: string = req?.params?.userId;
		const address = await PublicServices.beneficiaryAddress(userId);
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

export async function createSettlement(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const settlementRequest = req.body;
    console.log(settlementRequest);

    if (
      httpUtils.validateAttributes(
        ["userId", "transactionId", "settlementAmount"],
        settlementRequest,
        res,
        "body"
      )
    ) {
      const response = await AuthroizedServices.settlement(settlementRequest);
      console.log(response);
      res.status(codes.ACCEPTED).end();
    }
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
