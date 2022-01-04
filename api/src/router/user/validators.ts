import { body, param } from "express-validator";
import { mwVaildator } from "src/middlewares";

const idInParams = [param("id").notEmpty(), mwVaildator];

const notificationIdInParams = [
  param("notificationId").notEmpty(),
  mwVaildator,
];

export const createUser = [
  body("consent").isBoolean(),
  body("email").isEmail(),
  body("type").isString(), // 'customer' | 'business'
  body("customer.tag").optional().isString(),
  body("customer.avatar").optional().isString(),
  body("customer.address1").optional().isString(),
  body("customer.address2").optional().isString(),
  body("customer.city").optional().isString(),
  body("customer.state").optional().isString(),
  body("customer.postalCode").optional().isString(),
  body("customer.firstName").optional().isString(),
  body("customer.lastName").optional().isString(),
  body("business.story").optional().isString(),
  body("business.tag").optional().isString(),
  body("business.avatar").optional().isString(),
  body("business.type").optional().isString(),
  body("business.rbn").optional().isString(),
  body("business.industry").optional().isString(),
  body("business.ein").optional().isString(),
  body("business.address1").optional().isString(),
  body("business.address2").optional().isString(),
  body("business.city").optional().isString(),
  body("business.state").optional().isString(),
  body("business.postalCode").optional().isString(),
  body("business.phoneNumber").optional().isString(),
  body("business.owner.firstName").optional().isString(),
  body("business.owner.lastName").optional().isString(),
  body("business.owner.email").optional().isString(),
  body("business.owner.address1").optional().isString(),
  body("business.owner.address2").optional().isString(),
  body("business.owner.city").optional().isString(),
  body("business.owner.state").optional().isString(),
  body("business.owner.postalCode").optional().isString(),
  mwVaildator,
];

export const notifications = [...idInParams, ...notificationIdInParams];

export const getUser = [...idInParams];

export const deposit = [...idInParams, body("amount").isString(), mwVaildator];

export const addCustomer = [
  ...idInParams,
  body("customer.tag").optional().isString(),
  body("customer.avatar").optional().isString(),
  body("customer.address1").optional().isString(),
  body("customer.address2").optional().isString(),
  body("customer.city").optional().isString(),
  body("customer.state").optional().isString(),
  body("customer.postalCode").optional().isString(),
  body("customer.firstName").optional().isString(),
  body("customer.lastName").optional().isString(),
  mwVaildator,
];

export const updateCustomerProfile = [
  ...idInParams,
  body("customer.tag").isString(),
  body("customer.avatar").isString(),
  mwVaildator,
];

export const updateBusinessProfile = [
  ...idInParams,
  body("business.story").isString(),
  body("business.tag").isString(),
  body("business.avatar").isString(),
  body("business.address1").isString(),
  body("business.address2").isString(),
  body("business.city").isString(),
  body("business.state").isString(),
  body("business.postalCode").isString(),
  body("business.phoneNumber").isString(),
  mwVaildator,
];

export const addBusiness = [
  ...idInParams,
  body("business.story").optional().isString(),
  body("business.tag").optional().isString(),
  body("business.avatar").optional().isString(),
  body("business.type").optional().isString(),
  body("business.rbn").optional().isString(),
  body("business.industry").optional().isString(),
  body("business.ein").optional().isString(),
  body("business.address1").optional().isString(),
  body("business.address2").optional().isString(),
  body("business.city").optional().isString(),
  body("business.state").optional().isString(),
  body("business.postalCode").optional().isString(),
  body("business.phoneNumber").optional().isString(),
  body("business.owner.firstName").optional().isString(),
  body("business.owner.lastName").optional().isString(),
  body("business.owner.address1").optional().isString(),
  body("business.owner.address2").optional().isString(),
  body("business.owner.city").optional().isString(),
  body("business.owner.state").optional().isString(),
  body("business.owner.postalCode").optional().isString(),
  mwVaildator,
];

export const withdraw = [...idInParams, body("amount").isString(), mwVaildator];

export const transfer = [
  ...idInParams,
  body("toUserId").isString(),
  body("amount").isString(),
  body("roundUpAmount").optional().isString(),
  mwVaildator,
];
