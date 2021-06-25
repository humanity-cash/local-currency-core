/* eslint-disable @typescript-eslint/no-explicit-any */
import { NewUser, SettlementRequest } from "src/types";
import { toBytes32 } from "src/utils/crypto";
import * as contracts from "./contracts";

export async function createUser(newUser: NewUser): Promise<string> {
  // Do not convert to bytes32 here, it is done in contract only for new users so we can store the human legible userId on chain
  return await contracts.newWallet(newUser.userId);
}

export async function settlement(
  settlementRequest: SettlementRequest
): Promise<any> {
  return await contracts.settle(
    toBytes32(settlementRequest.userId),
    settlementRequest.transactionId,
    settlementRequest.settlementAmount
  );
}
