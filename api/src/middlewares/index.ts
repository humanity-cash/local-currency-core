import express from "express";
import { validationResult } from "express-validator";
import { verifyCognitoToken } from "../aws";
import { httpUtils } from "../utils";

export async function verifyRequest(
  request: express.Request,
  response: express.Response,
  next: express.NextFunction
): Promise<void> {
  if (process.env.NODE_ENV === "test") {
    next();
  } else {
    const authHeader = request?.headers?.authorization;
    if (!authHeader) {
      response
        .status(httpUtils.codes.UNAUTHORIZED)
        .send({ message: "No Auth Headers In Request" });
    } else {
      try {
        const verifyResponse = await verifyCognitoToken(authHeader);
        if (verifyResponse?.success) {
          next();
        } else {
          response
            .status(httpUtils.codes.UNAUTHORIZED)
            .send({ message: "User is Unauthorized" });
        }
      } catch (err) {
        response
          .status(httpUtils.codes.SERVER_ERROR)
          .send({ message: "Internal error while verifying request!" });
      }
    }
  }
}

export function mwVaildator(
  request: express.Request,
  response: express.Response,
  next: express.NextFunction
): express.Response | void {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response
      .status(httpUtils.codes.BAD_REQUEST)
      .json({ errors: errors.array() });
  } else {
    next();
  }
}
