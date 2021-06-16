import { Request, Response } from "express";
import * as AuthroizedServices from "src/service/AuthorizedService";
import * as PublicServices from "src/service/PublicService";
import { httpUtils } from "src/utils";

const codes = httpUtils.codes;

export async function getAllUsers(_req: Request, res: Response): Promise<void> {
  try {
    const users = await PublicServices.getAllBeneficiaries();
    httpUtils.createHttpResponse(users, codes.OK, res);
  } catch (err)  {
    httpUtils.createHttpResponse(
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
    const id = req?.query?.params.id;
    const user = await PublicServices.getBeneficiary(id);
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

export async function createUser(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    console.log(req.body);
    const newUser = req.body;

    if (httpUtils.validateAttributes(["userId"], newUser, res, "body")) {
      await AuthroizedServices.createUser(newUser);
      const user = await PublicServices.getBeneficiary(newUser.userId);
      httpUtils.createHttpResponse(user, codes.CREATED, res);
    }
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

export async function authorizeUser(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const authorizationRequest = req.body;
    console.log(authorizationRequest);

    if (
      httpUtils.validateAttributes(
        ["userId", "transactionId", "authorizationAmount"],
        authorizationRequest,
        res,
        "body"
      )
    ) {
      const response = await AuthroizedServices.authorization(authorizationRequest);
      console.log(response);
      res.status(codes.ACCEPTED).end();
    }
  } catch (err) {
    console.error(err);

    if (err.message?.includes("ERR_NO_BALANCE"))
      httpUtils.createHttpResponse(
        {
          message:
            "Authorization unsuccessful, not enough balance to authorize",
        },
        codes.UNPROCESSABLE,
        res
      );
    else if (err.message?.includes("ERR_AUTH_EXISTS"))
      httpUtils.createHttpResponse(
        {
          message:
            "Authorization unsuccessful, already exists for this transaction ID",
        },
        codes.UNPROCESSABLE,
        res
      );
    else if (err.message?.includes("ERR_ZERO_VALUE"))
      httpUtils.createHttpResponse(
        {
          message: "Authorization unsuccessful, cannot authorize for zero",
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

export async function deleteUserAuth(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const deleteAuth = req.body;
    console.log(deleteAuth);

    if (
      httpUtils.validateAttributes(
        ["transactionId", "userId"],
        deleteAuth,
        res,
        "body"
      )
    ) {
      const response = await AuthroizedServices.deleteAuthorization(
        deleteAuth.userId,
        deleteAuth.transactionId
      );
      console.log(response);
      res.status(codes.NO_CONTENT).end();
    }
  } catch (err) {
    console.error(err);
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
  res: Response,
): Promise<void> {
  try {
		const mockGetAllUserIds = () => ([]) 
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

export async function getUserSettlements(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const userId: string = req?.params?.id;
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

export async function createSettlementForUser(
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
