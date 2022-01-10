import { ACHAPI } from 'api';
import { useEffect } from 'react';
import { useStore } from 'react-hookstore';
import { MockACHData } from '../mock';
import { ACH_DATA_STORE } from '../store';
import { ACHDataState } from '../types';
import moment from 'moment';

const useACHData = (): ACHDataState => {
	const [achDataState, setACHDataState]: [ACHDataState, any] = useStore(ACH_DATA_STORE);
	useEffect(() => {
		updateACHData()
	}, [setACHDataState]);

	const updateACHData = async () => {
		const deposits = await ACHAPI.getAllDeposits()
		const withdrawals = await ACHAPI.getAllWithdrawals()
		const data = [...deposits, ...withdrawals].sort((t1, t2) => {
			return t1.timestamp > t2.timestamp ? 1 : -1
		}).map((tx, index) => {
			return {
				username: 'John Doe', 
				type: tx.type,
				createdAt: moment(tx.timestamp).format("yyyy-MM-DD HH:mm:ss"),
				confirmedAt: 0,
				amount: tx.value,
				berksharesBank: 'Bank Of Country',
				userBank: 'Bank Of Country',
				bankAccount: '1G1C1G2343ER',
				status: 'Success',
				transactionId: index+1
			}
		})
		setACHDataState((pv: any) => ({ ...pv, data: data }));
	}

	return achDataState;
}

export default useACHData;