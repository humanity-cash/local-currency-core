import { START_CONTRACT, STATS_TRANSFER, STOP_CONTRACT } from 'consts';
import * as BaseAPI from '../base';

type Hash = string;

export const getAllTransfers = async () => {
	try {
		const response = await BaseAPI.getRequest(STATS_TRANSFER);

		return response;
	}	catch(err) {
		console.log('err', err);
	}
}

export const startContract = async (hash: Hash) => {
	try {
		const response = await BaseAPI.postRequest(START_CONTRACT, { hash });

		return response;
	}	catch(err) {
		console.log('err', err);
	}
}

export const stopContract = async (hash: Hash) => {
	try {
		const response = await BaseAPI.postRequest(STOP_CONTRACT, { hash });

		return response;
	}	catch(err) {
		console.log('err', err);
	}
}
