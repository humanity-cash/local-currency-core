import { body, param } from "express-validator";
import { mwVaildator } from "src/middlewares";

const idInParams = [param("id").notEmpty(), mwVaildator];

export const createUser = [
  body("authUserId").isString(),
  body("authUserId").custom((value, { req }) => {
    const businessName: string = req.body.businessName || "";
    if (businessName) {
      if (value.charAt(0) != "m") {
        throw "Business accounts authUserId must begin with the prefix 'm'";
      }
    } else {
      if (value.charAt(0) != "p") {
        throw "Personal accounts authUserId must begin with the prefix 'p'";
      }
    }
    return true;
  }),
  body("firstName").isString(),
  body("lastName").isString(),
  body("email").isString(),
  body("address1").isString(),
  body("address2").isString(),
  body("city").isString(),
  body("state").isString(),
  body("postalCode").isString(),
  body("businessName").optional(),
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
