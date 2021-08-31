import { body } from "express-validator";
import { mwVaildator } from "src/middlewares";

export const transferOwnerController = [
  body(
    "newOwner",
    "Transfer controller payload must contain string 'newOwner' attribute"
  ).isString(),
  mwVaildator
];

export const transferOwnerUser = [
  body(
    "newOwner",
    "Transfer controller payload must contain string 'newOwner' attribute"
  ).isString(),
  body(
    "userId",
    "Transfer controller payload must contain string 'userId' attribute"
  ).isString(),
  mwVaildator
];
