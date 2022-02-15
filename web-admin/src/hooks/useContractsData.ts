import { useEffect } from "react";
import { useStore } from "react-hookstore";
import { MockContractsData } from "../mock";
import { CONTRACTS_STORE } from "../store";
import { ContractsState } from "../types";

const useContractsState = (): ContractsState => {
  const [contractsState, setContractsState] = useStore(CONTRACTS_STORE);
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setContractsState((pv: any) => ({ ...pv, data: MockContractsData }));
  }, []);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  return contractsState;
};

export default useContractsState;
