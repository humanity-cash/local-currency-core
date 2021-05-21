export interface HealthResponse {
  blockNumber: string;
  chainId: string;
  nodeInfo: string;
  disbursementWei: string;
  cUBIAuthToken: string;
  cUSDToken: string;
  reconciliationAccount: string;
  countOfBeneficiaries: number;
}

export interface UBIBeneficiary {
  userId: string;
  address: string;
  createdBlock: string;
  availableBalance: number;
  pendingAuthorizations: number;
  totalBalance: number;
}

export interface Authorization {
  transactionId: string;
  authorizationAmount: number;
  deauthorized: boolean;
}

export interface Settlement {
  transactionId: string;
  settlementAmount: number;
}
export interface NewUser {
  userId: string;
}
export interface AuthorizationRequest {
  userId: string;
  transactionId: string;
  authorizationAmount: number;
}
export interface SettlementRequest {
  userId: string;
  transactionId: string;
  settlementAmount: number;
}
