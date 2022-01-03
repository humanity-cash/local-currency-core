import { body } from "express-validator";
import { mwVaildator, verifyRequest } from "src/middlewares";

export const transferOwnerController = [
  verifyRequest,
  body(
    "newOwner",
    "Transfer controller payload must contain string 'newOwner' attribute"
  ).isString(),
  mwVaildator,
];

export const transferOwnerUser = [
  verifyRequest,
  body(
    "newOwner",
    "Transfer controller payload must contain string 'newOwner' attribute"
  ).isString(),
  body(
    "userId",
    "Transfer controller payload must contain string 'userId' attribute"
  ).isString(),
  mwVaildator,
];
