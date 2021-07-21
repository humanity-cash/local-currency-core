import { GET_CONTRACTS, START_CONTRACT, STOP_CONTRACT } from 'consts';
import * as BaseAPI from '../base';

type Hash = string;

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

export const getContracts = async () => {
	try {
		const response = await BaseAPI.getRequest(GET_CONTRACTS);

		return response;
	}	catch(err) {
		console.log('err', err);
	}
}