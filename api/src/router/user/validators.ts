import { body, param } from "express-validator";
import { mwVaildator } from "src/middlewares";

const idInParams = [param("id").notEmpty(), mwVaildator];

export const createUser = [
  body("userId").isString(),
  body("firstName").isString(),
  body("lastName").isString(),
  body("email").isString(),
  body("address1").isString(),
  body("address2").isString(),
  body("city").isString(),
  body("state").isString(),
  body("postalCode").isString(),
  mwVaildator,
];

export const getUser = [...idInParams];

export const deposit = [...idInParams, body("amount").isString(), mwVaildator];

export const withdraw = [...idInParams, body("amount").isString(), mwVaildator];

export const transfer = [
  ...idInParams,
  body("toUserId").isString(),
  body("amount").isString(),
  mwVaildator,
];
