import { START_CONTRACT, STATS_TRANSFER, STOP_CONTRACT } from "consts";
import * as BaseAPI from "../base";
import { formatTransfers } from "../../formatters/index";
import { IBlockchainTransaction } from "../../types";

type Hash = string;

export const getAllTransfers = async (): Promise<IBlockchainTransaction[]> => {
  try {
    const response = await BaseAPI.getRequest(STATS_TRANSFER);

    return formatTransfers(response);
  } catch (err) {
    console.log("err", err);
    return [];
  }
};

export const startContract = async (hash: Hash) => {
  try {
    const response = await BaseAPI.postRequest(START_CONTRACT, { hash });

    return response;
  } catch (err) {
    console.log("err", err);
  }
};

export const stopContract = async (hash: Hash) => {
  try {
    const response = await BaseAPI.postRequest(STOP_CONTRACT, { hash });

    return response;
  } catch (err) {
    console.log("err", err);
  }
};
