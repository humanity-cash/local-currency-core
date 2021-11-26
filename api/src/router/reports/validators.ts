import { body, param } from "express-validator";
import { mwVaildator } from "src/middlewares";

const idInParams = [param("id").notEmpty(), mwVaildator];

export const reportPeriod = [
	...idInParams,
	body("fromTime").isNumeric, //unix
	body("toTime").isNumeric, //unix
	mwVaildator,
];
