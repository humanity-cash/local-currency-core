import { USERS } from 'consts';
import { IUser } from '../../types';
import * as BaseAPI from '../base';
import { formatUser } from '../../formatters/index';

export const getAllUsers = async (): Promise<IUser[]> => {
	try {
        const response = await BaseAPI.getRequest(USERS);

		return formatUser(response);
	}	catch(err) {
		console.log('err', err);
		return []
	}
}

