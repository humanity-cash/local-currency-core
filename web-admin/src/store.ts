import { createStore } from "react-hookstore";
import { ContractsState } from "./types";

export const CONTRACTS_STORE = 'contracts_stores';

const contractsStoreInitialState: ContractsState  = {
	data: []
}
createStore(CONTRACTS_STORE, contractsStoreInitialState);
