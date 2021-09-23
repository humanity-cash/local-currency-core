import express from "express";
import { validationResult } from "express-validator";
import { verifyCognitoToken } from "src/aws";
import { httpUtils, log } from "src/utils";

export const verifyRequest: express.RequestHandler = async (
  request: express.Request,
  response: express.Response,
  next: express.NextFunction
) => {
  const authHeader = request?.headers?.authorization;
  if (!authHeader) {
    response
      .status(httpUtils.codes.UNAUTHORIZED)
      .send({ message: "No Auth Headers In Request" });
  } else {
    try {
      const verifyResponse = await verifyCognitoToken(authHeader);
      if (verifyResponse?.success) {
        /** Extract user Id from token
          const id = verifyResponse.token.username;
          request.userId = id;
          console.log(`Verified ${id} successfully`);
        */
        next();
      } else {
        response
          .status(httpUtils.codes.UNAUTHORIZED)
          .send({ message: "User is Unauthorized" });
      }
    } catch (err) {
      log("Error in verifying request", err);
      response
        .status(httpUtils.codes.SERVER_ERROR)
        .send({ message: "Internal error while verifying request!" });
    }
  }
};

export const mwVaildator = (
  request: express.Request,
  response: express.Response,
  next: express.NextFunction
): express.Response | void => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response
      .status(httpUtils.codes.BAD_REQUEST)
      .json({ errors: errors.array() });
  } else {
    next();
  }
};
