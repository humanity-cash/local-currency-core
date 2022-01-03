import { body, param } from "express-validator";
import { mwVaildator, verifyRequest } from "src/middlewares";

const idInParams = [param("id").notEmpty(), mwVaildator];

export const reportPeriod = [
  verifyRequest,
  ...idInParams,
  body("fromTime").isNumeric, //unix
  body("toTime").isNumeric, //unix
  mwVaildator,
];
