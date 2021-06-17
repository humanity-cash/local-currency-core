import express from 'express';
import * as controller from './controller';
import * as validators from './validators';

const user = express();

user.get("/users", controller.getAllUsers); 
user.get("/users/:id", validators.getUser, controller.getUser);
user.post("/users", validators.createUser, controller.createUser);

user.get("/users/:id/authorizations", validators.getUserAuthorizations, controller.getUserAuthorizations);
user.post("/users/:id/authorizations", validators.authorizeUser, controller.authorizeUser);
user.delete("/user/:id/authorizations", validators.deleteUserAuthorization, controller.deleteUserAuthorization); 

user.get("/users/:id/settlements", validators.getUserSettlements, controller.getUserSettlements); 
user.get("/users/all/settlements", controller.getAllUsersSettlements);
user.post("/users/:id/settlements", validators.createUserSettlement, controller.createSettlementForUser);


export default user