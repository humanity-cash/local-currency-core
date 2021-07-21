import { useEffect } from 'react';
import { useStore } from 'react-hookstore';
import { MockContractsData } from '../mock';
import { CONTRACTS_STORE } from '../store';
import { ContractsState } from '../types';

const useContractsState = (): ContractsState => {
	const [contractsState, setContractsState] = useStore(CONTRACTS_STORE)
	useEffect(() => {
		setContractsState((pv: any) => ({...pv, data: MockContractsData}));
	}, [])

	//@ts-ignore
	return contractsState;
}

export default useContractsState;