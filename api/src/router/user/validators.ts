import { body, param } from 'express-validator';
import { mwVaildator } from 'src/middlewares';

export const createUserSettlement = [ 
	body("userId").isString(),
	body("transactionId").isString(),
	body("settlementAmount").isNumeric(),
	mwVaildator
];

export const createUser = [ 
	body("userId").isString(),
	mwVaildator
];

export const getUser = [ 
	param("userId").isBase32(),
	mwVaildator
];