import { body, param } from "express-validator";
import { mwVaildator } from "src/middlewares";

const idInParams = [param("id").notEmpty(), mwVaildator];
const notificationIdInParams = [
  param("notificationId").notEmpty(),
  mwVaildator,
];

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

export const notifications = [...idInParams, ...notificationIdInParams];

export const getUser = [...idInParams];

export const deposit = [...idInParams, body("amount").isString(), mwVaildator];

export const addCustomerVerification = [
  ...idInParams, 
  body("business.dowllaId").isString(),
  body("customer.tag").isString(),
  body("customer.avatar").isString(),
  body("customer.address1").isString(),
  body("customer.address2").isString(),
  body("customer.city").isString(),
  body("customer.state").isString(),
  body("customer.postalCode").isString(),
  body("customer.firstName").isString(),
  body("customer.lastName").isString(),
  mwVaildator
];

export const addBusinessVerification = [
  ...idInParams, 
  body("customer.dowllaId").isString(),
  body("business.story").isString(),
  body("business.tag").isString(),
  body("business.avatar").isString(),
  body("business.type").isString(),
  body("business.rbn").isString(),
  body("business.industry").isString(),
  body("business.ein").isString(),
  body("business.address1").isString(),
  body("business.address2").isString(),
  body("business.city").isString(),
  body("business.state").isString(),
  body("business.postalCode").isString(),
  body("business.phoneNumber").isString(),
  body("business.owner.firstName").isString(),
  body("business.owner.lastName").isString(),
  body("business.owner.email").isString(),
  body("business.owner.address1").isString(),
  body("business.owner.address2").isString(),
  body("business.owner.city").isString(),
  body("business.owner.state").isString(),
  body("business.owner.postalCode").isString(),
  mwVaildator
];

export const withdraw = [...idInParams, body("amount").isString(), mwVaildator];

export const transfer = [
  ...idInParams,
  body("toUserId").isString(),
  body("amount").isString(),
  mwVaildator,
];
