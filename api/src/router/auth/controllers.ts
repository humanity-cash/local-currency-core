import { Request, Response } from "express";
import * as AuthService from "src/service/AuthService";
import { Business, Customer } from "src/types";
import { httpUtils } from "src/utils";

export async function createUser(request: Request, response: Response) {
	try {
		const { email, consent } = request.body;
		const user = await AuthService.createUser({ email, consent });

		return httpUtils.createHttpResponse(user, 200, response);
	} catch (error) {
		httpUtils.serverError(error, response);
	}
}

export async function verifyCustomer(request: Request, response: Response) {
	try {
		const customer: Customer = request.body.customer;
		const email: string = request.body.email;
		const user = await AuthService.verifyCustomer({ email, customer });

		return httpUtils.createHttpResponse(user, 200, response);
	} catch (error) {
		httpUtils.serverError(error, response);
	}
}

export async function verifyBusiness(request: Request, response: Response) {
	try {
		const business: Business = request.body.customer;
		const email: string = request.body.email;
		const user = await AuthService.verifyBusiness({ email, business });

		return httpUtils.createHttpResponse(user, 200, response);
	} catch (error) {
		httpUtils.serverError(error, response);
	}
}

// export async function updateCustomer(request: Request, response: Response) {
// 	try {
// 		const { email, consent } = request.body;
// 		const user = await UserDatabaseService.create({ email, consent });

// 		return httpUtils.createHttpResponse(user, 200, response);
// 	} catch (error) {
// 		httpUtils.serverError(error, response);
// 	}
// }

// export async function updateBusiness(request: Request, response: Response) {
// 	try {
// 		const { email, consent } = request.body;
// 		const user = await UserDatabaseService.create({ email, consent });

// 		return httpUtils.createHttpResponse(user, 200, response);
// 	} catch (error) {
// 		console.log('error', error);
// 	}
// }