import { ACHAPI } from "api";
import { useEffect } from "react";
import { useStore } from "react-hookstore";
import { MockACHData } from "../mock";
import { OPERATOR_DATA_STORE } from "../store";
import { OperatorData } from "../types";

const useOperatorData = (): OperatorData[] => {
  const [operatorDataState, setOperatorDataState]: [OperatorData[], any] =
    useStore(OPERATOR_DATA_STORE);
  useEffect(() => {
    updateOperatorData();
  }, [setOperatorDataState]);

  const updateOperatorData = async () => {
    const operators = await ACHAPI.getAllOperators();
  
    setOperatorDataState((pv: any) => ({ ...pv, ...operators }));
  };

  return operatorDataState;
};

export default useOperatorData;
