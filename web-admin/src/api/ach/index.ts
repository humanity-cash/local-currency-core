import { STATS_DEPOSITS, STATS_OPERATOR, STATS_WITHDRAWAL } from "consts";
import * as BaseAPI from '../base';

export const getAllWithdrawals = async () => {
	try {
		const response = await BaseAPI.getRequest(STATS_WITHDRAWAL);

		return response;
	} catch (err) {
		console.log('err', err);
	}
}

export const getAllDeposits = async () => {
	try {
		const response = await BaseAPI.getRequest(STATS_DEPOSITS);

		return response;
	} catch (err) {
		console.log('err', err);
	}
}

export const getAllOperators = async () => {
	try {
		const response = await BaseAPI.getRequest(STATS_OPERATOR);

		return response;
	} catch (err) {
		console.log('err', err);
	}
}