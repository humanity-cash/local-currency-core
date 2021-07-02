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

export const deposit = [...idInParams, body("amount").isString(), mwVaildator];

export const transfer = [
  ...idInParams,
  body("toUserId").isString(),
  body("amount").isString(),
  mwVaildator,
];
