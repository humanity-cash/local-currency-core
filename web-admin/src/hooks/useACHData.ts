import { useEffect } from 'react';
import { useStore } from 'react-hookstore';
import { MockACHData } from '../mock';
import { ACH_DATA_STORE } from '../store';
import { ACHDataState } from '../types';

const useACHData = (): ACHDataState => {
	const [achDataState, setACHDataState]: [ACHDataState, any] = useStore(ACH_DATA_STORE);
	useEffect(() => {
		setACHDataState((pv: any) => ({ ...pv, data: MockACHData }));
	}, [setACHDataState]);

	return achDataState;
}

export default useACHData;