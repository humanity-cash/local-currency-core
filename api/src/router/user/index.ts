import express from 'express';
import * as controller from './controller';
import * as validators from './validators';

export const user = express();

user.get("/users", controller.getAllUsers);  // get all users 
user.get("/users/:id", controller.getUser);  // get user
user.post("/users", validators.createTransaction, controller.createSettlement); // create user

user.get("/users/:id/authorizations", controller.getUser); // get user authorizations
user.post("/users/:id/authorizations", controller.getSettlements);  // authorize user 
user.delete("/user/:id/authorizations", controller.getSettlements); // delete user authorization 

user.get("/users/:id/settlements", controller.getUser); // get user settlements
user.get("/users/all/settlements", controller.getUser);  // get all settlements
user.post("/users/:id/settlements", controller.getUser); // create user settlement