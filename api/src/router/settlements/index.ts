import express from 'express';
import * as controller from './controller';
import * as validators from './validators';

export const settlements = express();

settlements.post("/settle", validators.createTransaction, controller.createSettlement); //create single transaction
settlements.get("/settle", controller.getSettlements); //get single transation
settlements.get("/settle/all", controller.getSettlements); //get all transactions