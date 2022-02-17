import { ACHAPI } from "api";
import { useEffect } from "react";
import { useStore } from "react-hookstore";
import { OPERATOR_DATA_STORE } from "../store";
import { OperatorDataState } from '../types';

const useOperatorData = (): OperatorDataState => {
  const [operatorDataState, setOperatorDataState]: [OperatorDataState, any] =
    useStore(OPERATOR_DATA_STORE);
  useEffect(() => {
    updateOperatorData();
  }, [setOperatorDataState]);

  const updateOperatorData = async () => {
    const data = await ACHAPI.getAllOperators();
  
    setOperatorDataState((pv: any) => ({ ...pv, data: data }));
  };

  return operatorDataState;
};

export default useOperatorData;
