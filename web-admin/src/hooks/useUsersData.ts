import { useEffect } from 'react';
import { UserDataState } from '../types';
import { UserAPI } from 'api';
import { useStore } from 'react-hookstore';
import { USER_DATA_STORE } from '../store';

const useUsersData = (): UserDataState => {
	const [userDataState, setUserDataState]: [UserDataState, any] = useStore(USER_DATA_STORE)
	useEffect(() => {
		updateUserData()
		// setUserData(MockUserData);
	}, [])

	const updateUserData = async () => {
		const iUsers = await UserAPI.getAllUsers()
		const users = iUsers.map((user) => {
			return {
				email: 'email@email.com', 
				name: 'John Doe',
				dowllaId: user.userId, 
				outstandingBalance: user.availableBalance,
				lastLogin: 9983283232, 
				type: 'Personal',
				address: 'Holloway 89832, Boston',
				blockchainAddress: user.address
			}
		})

		setUserDataState((pv: any) => ({ ...pv, data: users }));
	}

	return userDataState;
}

export default useUsersData;