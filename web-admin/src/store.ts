import { createStore } from "react-hookstore";
import {
  ACHDataState,
  BlockchainDataState,
  ContractsState,
  ModalState,
} from "./types";

export const CONTRACTS_STORE = "contracts_store";
export const BLOCKCHAIN_DATA_STORE = "blockchain_store";
export const ACH_DATA_STORE = "ach_store";
export const MODAL_STORE = "modal_store";

const ACHDataStoreInitialState: ACHDataState = {
  data: [],
};

const BlockchainDataStoreInitialState: BlockchainDataState = {
  data: [],
};

const contractsStoreInitialState: ContractsState = {
  data: [],
};

const modalStoreInitialState: ModalState = {
  isOpen: false,
  modalProps: {},
  type: "",
};

createStore(CONTRACTS_STORE, contractsStoreInitialState);
createStore(MODAL_STORE, modalStoreInitialState);
createStore(BLOCKCHAIN_DATA_STORE, BlockchainDataStoreInitialState);
createStore(ACH_DATA_STORE, ACHDataStoreInitialState);
