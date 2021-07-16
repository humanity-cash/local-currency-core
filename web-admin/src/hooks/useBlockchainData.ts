import { useEffect } from 'react';
import { useStore } from 'react-hookstore';
import { MockBCData } from '../mock';
import { BLOCKCHAIN_DATA_STORE } from '../store';
import { BlockchainDataState } from '../types';

const useBlockchainData = (): BlockchainDataState => {
	const [blockchainDataState, setBlockchainDataState]: [BlockchainDataState, any] = useStore(BLOCKCHAIN_DATA_STORE);
	useEffect(() => {
		setBlockchainDataState((pv: any) => ({ ...pv, data: MockBCData }));
	}, []);

	return blockchainDataState;
}

export default useBlockchainData;