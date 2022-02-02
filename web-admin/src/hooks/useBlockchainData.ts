import { useEffect } from "react";
import { useStore } from "react-hookstore";
import { MockBCData } from "../mock";
import { BLOCKCHAIN_DATA_STORE } from "../store";
import { BlockchainDataState } from "../types";
import { ACHAPI, ContractsAPI } from "api";
import moment from "moment";

const useBlockchainData = (): BlockchainDataState => {
  const [blockchainDataState, setBlockchainDataState]: [
    BlockchainDataState,
    any
  ] = useStore(BLOCKCHAIN_DATA_STORE);
  useEffect(() => {
    updateACHData();
  }, []);

  const updateACHData = async () => {
    const deposits = await ACHAPI.getAllDeposits();
    const withdrawals = await ACHAPI.getAllWithdrawals();
    const achTransactions = [...deposits, ...withdrawals].map((tx) => {
      return {
        transactionHash: tx.transactionHash,
        amount: tx.value,
        from: "0x10000000000000",
        to: "0x10000000000000",
        fromUser: "John Doe",
        toUser: "John Dog",
        blocksConfirmed: 3,
        type: tx.type,
        createdAt: moment(tx.timestamp).format("yyyy-MM-DD HH:mm:ss"),
      };
    });

    const transfers = await ContractsAPI.getAllTransfers();
    const bTransactions = transfers.map((tx) => {
      return {
        transactionHash: tx.transactionHash,
        amount: tx.value,
        from: tx.fromAddress,
        to: tx.toAddress,
        fromUser: tx.fromUserId,
        toUser: tx.toUserId,
        blocksConfirmed: tx.blockNumber,
        type: tx.type,
        createdAt: moment(tx.timestamp).format("yyyy-MM-DD HH:mm:ss"),
      };
    });
    const data = [...achTransactions, ...bTransactions].sort((t1, t2) => {
      return t1.createdAt > t2.createdAt ? 1 : -1;
    });
    setBlockchainDataState((pv: any) => ({ ...pv, data: data }));
  };
  return blockchainDataState;
};

export default useBlockchainData;
