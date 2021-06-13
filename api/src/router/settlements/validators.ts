import {mwVaildator} from 'src/middlewares'
import { body } from 'express-validator';

export const createTransaction =[ 
	body("userId").isString(),
	body("transactionId").isString(),
	body("settlementAmount").isNumeric(),
	mwVaildator
]
