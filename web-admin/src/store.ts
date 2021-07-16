import { createStore } from "react-hookstore";
import { ContractsState, ModalState } from "./types";

export const CONTRACTS_STORE = 'contracts_store';
export const MODAL_STORE = 'modal_store';

const contractsStoreInitialState: ContractsState  = {
	data: []
}

const modalStoreInitialState: ModalState = {
		isOpen: false,
		modalProps: {},
		type: ''
}

createStore(CONTRACTS_STORE, contractsStoreInitialState);
createStore(MODAL_STORE, modalStoreInitialState);
