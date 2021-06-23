import { body, param } from "express-validator";
import { mwVaildator } from "src/middlewares";

const idInParams = [param("id").notEmpty(), mwVaildator];

export const createUserSettlement = [
  body("userId").isString(),
  body("transactionId").isString(),
  body("settlementAmount").isNumeric(),
  mwVaildator,
];

export const createUser = [body("userId").isString(), mwVaildator];

export const getUser = [...idInParams];

export const getUserAuthorizations = [...idInParams];

export const authorizeUser = [
  body("userId").isString(),
  body("transactionId").isString(),
  body("authorizationAmount").isNumeric(),
  mwVaildator,
];

export const deleteUserAuthorization = [
  body("userId").isString(),
  body("transactionId").isString(),
  mwVaildator,
];

export const getUserSettlements = [...idInParams];
