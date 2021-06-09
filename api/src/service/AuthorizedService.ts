import * as CeloUBI from "./celoubi/CeloUbi";
import { toBytes32 } from "../utils/utils";
import {
  NewUser,
  AuthorizationRequest,
  SettlementRequest,
} from "../types/types";

export async function createUser(newUser: NewUser): Promise<string> {
  // Do not convert to bytes32 here, it is done in contract only for new users so we can store the human legible userId on chain
  return await CeloUBI.newUbiBeneficiary(newUser.userId);
}

export async function authorization(
  authorizationRequest: AuthorizationRequest
): Promise<any> {
  return await CeloUBI.authorize(
    toBytes32(authorizationRequest.userId),
    authorizationRequest.transactionId,
    authorizationRequest.authorizationAmount
  );
}

export async function deleteAuthorization(
  userId: string,
  transactionId: string
): Promise<any> {
  return await CeloUBI.deauthorize(toBytes32(userId), transactionId);
}

export async function settlement(
  settlementRequest: SettlementRequest
): Promise<any> {
  return await CeloUBI.settle(
    toBytes32(settlementRequest.userId),
    settlementRequest.transactionId,
    settlementRequest.settlementAmount
  );
}
