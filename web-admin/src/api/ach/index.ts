import { STATS_DEPOSITS, STATS_OPERATOR, STATS_WITHDRAWAL } from "consts";
import * as BaseAPI from "../base";
import { formatWithdrawals, formatDeposits, formatOperators } from "../../formatters/index";
import { IACHTransaction, OperatorData } from "../../types";

export const getAllWithdrawals = async (): Promise<IACHTransaction[]> => {
  try {
    const response = await BaseAPI.getRequest(STATS_WITHDRAWAL);

    return formatWithdrawals(response) || [];
  } catch (err) {
    console.log("err", err);
    return [];
  }
};

export const getAllDeposits = async (): Promise<IACHTransaction[]> => {
  try {
    const response = await BaseAPI.getRequest(STATS_DEPOSITS);

    return formatDeposits(response) || [];
  } catch (err) {
    console.log("err", err);
    return [];
  }
};

export const getAllOperators = async (): Promise<OperatorData[]> => {
  try {
    const response = await BaseAPI.getRequest(STATS_OPERATOR);

    return formatOperators(response);
  } catch (err) {
    console.log("err", err);
    return [];
  }
};
