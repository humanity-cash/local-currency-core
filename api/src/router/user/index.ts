import express from "express";
import * as controller from "./controller";
import * as validators from "./validators";

const user = express();

user.get("/users", controller.getAllUsers);
user.get("/users/:id", validators.getUser, controller.getUser);
user.post("/users/:id/deposit", validators.deposit, controller.deposit);
user.post("/users/:id/transfer", validators.deposit, controller.transferTo);
user.post("/users", validators.createUser, controller.createUser);

export default user;
