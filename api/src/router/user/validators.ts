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
]

export const notifications = [...idInParams, ...notificationIdInParams];

export const getUser = [...idInParams];

export const deposit = [...idInParams, body("amount").isString(), mwVaildator];

export const addCustomer = [
  ...idInParams, 
  body("business.dwollaId").isString(),
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

export const addBusiness = [
  ...idInParams, 
  body("customer.dwollaId").isString(),
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
