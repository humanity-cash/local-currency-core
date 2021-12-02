import express from "express";
import * as controller from "./controller";
import * as validators from "./validators";

const user = express();

// Get and create user(s)
user.get("/users", controller.getAllUsers);
user.post("/users", validators.createUser, controller.createUser);
user.get("/users/:id", validators.getUser, controller.getUser); // User dwolla info
user.get("/users/email/:email", controller.getUserByEmail); // User database info

// Get and create deposit(s) for a user
user.get("/users/:id/deposit", validators.getUser, controller.getDeposits);
user.post("/users/:id/deposit", validators.deposit, controller.deposit);

// Get and create withdrawal(s) for a user
user.get("/users/:id/withdraw", validators.getUser, controller.getWithdrawals);
user.post("/users/:id/withdraw", validators.withdraw, controller.withdraw);

// Get and create transfer(s) for a user
user.get("/users/:id/transfer", validators.getUser, controller.getTransfers);
user.post("/users/:id/transfer", validators.transfer, controller.transferTo);

// Get Dwolla iav-token for a user (via POST)
user.post("/users/:id/iav-token", validators.getUser, controller.getIAVToken);

// Get funding sources for a user
user.get(
  "/users/:id/funding-sources",
  validators.getUser,
  controller.getFundingSources
);

// Get and close notifications for a user
user.get(
  "/users/:id/notifications",
  validators.getUser,
  controller.getNotifications
);
user.delete(
  "/users/:id/notifications/:notificationId",
  validators.notifications,
  controller.closeNotification
);

// Add Customer account to existing Business account
user.post(
  "/users/:id/customer",
  validators.addCustomer,
  controller.addCustomer
);

// Add Business account to existing Customer account
user.post(
  "/users/:id/business",
  validators.addBusiness,
  controller.addBusiness
);

// Update existing Customer Account
user.put(
  "/users/:id/customer/profile",
  validators.updateCustomerProfile,
  controller.updateCustomerProfile
);

// Update existing Business Account
user.put(
  "/users/:id/business/profile",
  validators.updateBusinessProfile,
  controller.updateBusinessProfile
);

export default user;
