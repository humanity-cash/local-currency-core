import * as UBIControllerContract from "./abi/UBIController.json";
import * as UBIBeneficiaryContract from "./abi/UBIBeneficiary.json";
import { toBytes32 } from "../../utils/utils";
import * as web3Utils from "web3-utils";
import { UBIBeneficiary, Authorization, Settlement } from "../../types/types";

import * as Kit from "@celo/contractkit";
import { generateKeys } from "@celo/utils/lib/account";
import { privateKeyToAddress } from "@celo/utils/lib/address";
import { TransactionReceipt } from "web3-core";

const getKit = async (): Promise<Kit.ContractKit> => {
  const key = await generateKeys(process.env.CELO_UBI_MNEMONIC);
  const kit = Kit.newKit(process.env.CELO_UBI_RPC_HOST);
  await kit.setFeeCurrency(Kit.CeloContract.GoldToken);
  kit.addAccount(key.privateKey);
  const account = privateKeyToAddress(key.privateKey);
  kit.defaultAccount = account;
  return kit;
};

const getUBIControllerContract = async (): Promise<any> => {
  const kit = await getKit();
  const abi: web3Utils.AbiItem[] = JSON.parse(
    JSON.stringify(UBIControllerContract.abi)
  );
  const contract = new kit.web3.eth.Contract(abi, process.env.CELO_UBI_ADDRESS);
  return contract;
};

const getBeneficiaryContractFor = async (address: string): Promise<any> => {
  const kit = await getKit();
  const abi: web3Utils.AbiItem[] = JSON.parse(
    JSON.stringify(UBIBeneficiaryContract.abi)
  );
  const contract = new kit.web3.eth.Contract(abi, address);
  return contract;
};

export async function disbursementWei(): Promise<number> {
  const celoUBI = await getUBIControllerContract();
  const disbursementWei = await celoUBI.methods.disbursementWei().call();
  return disbursementWei;
}

export async function owner(): Promise<string> {
  const celoUBI = await getUBIControllerContract();
  const owner = await celoUBI.methods.owner().call();
  return owner;
}

export async function cUSDToken(): Promise<string> {
  const celoUBI = await getUBIControllerContract();
  const cUSDToken = await celoUBI.methods.cUSDToken().call();
  return cUSDToken;
}

export async function cUBIAuthToken(): Promise<string> {
  const celoUBI = await getUBIControllerContract();
  const cUBIAuthToken = await celoUBI.methods.cUBIAuthToken().call();
  return cUBIAuthToken;
}

export async function reconciliationAccount(): Promise<string> {
  const celoUBI = await getUBIControllerContract();
  const reconciliationAccount = await celoUBI.methods
    .reconciliationAccount()
    .call();
  return reconciliationAccount;
}

export async function beneficiaryAddress(userId: string): Promise<string> {
  const celoUBI = await getUBIControllerContract();
  const address = await celoUBI.methods.beneficiaryAddress(userId).call();
  return address;
}

export async function newUbiBeneficiary(userId: string): Promise<string> {
  const kit = await getKit();
  const celoUBI = await getUBIControllerContract();
  const txo = await celoUBI.methods.newUbiBeneficiary(userId);
  const tx = await kit.sendTransactionObject(txo, {
    from: kit.defaultAccount,
  });
  await tx.getHash();
  await tx.waitReceipt();
  return await beneficiaryAddress(toBytes32(userId));
}

export async function setCustodian(
  address: string
): Promise<TransactionReceipt> {
  const kit = await getKit();
  const celoUBI = await getUBIControllerContract();
  const txo = await celoUBI.methods.setCustodian(address);
  const tx = await kit.sendTransactionObject(txo, {
    from: kit.defaultAccount,
  });
  await tx.getHash();
  const receipt = await tx.waitReceipt();
  return receipt;
}

export async function balanceOfUBIBeneficiary(userId: string): Promise<string> {
  const celoUBI = await getUBIControllerContract();
  const balance = await celoUBI.methods.balanceOfUBIBeneficiary(userId).call();
  return balance;
}

export async function authBalanceOfUBIBeneficiary(
  userId: string
): Promise<string> {
  const celoUBI = await getUBIControllerContract();
  const balance = await celoUBI.methods
    .authBalanceOfUBIBeneficiary(userId)
    .call();
  return balance;
}

export async function authorize(
  userId: string,
  transactionId: string,
  value: number
): Promise<TransactionReceipt> {
  const kit = await getKit();
  const celoUBI = await getUBIControllerContract();
  const valueInWei = web3Utils.toWei(`${value}`, "ether");
  const txo = await celoUBI.methods.authorize(
    userId,
    transactionId,
    valueInWei
  );
  const tx = await kit.sendTransactionObject(txo, {
    from: kit.defaultAccount,
  });
  await tx.getHash();
  const receipt = await tx.waitReceipt();
  return receipt;
}

export async function deauthorize(
  userId: string,
  transactionId: string
): Promise<TransactionReceipt> {
  const kit = await getKit();
  const celoUBI = await getUBIControllerContract();
  const txo = await celoUBI.methods.deauthorize(userId, transactionId);
  const tx = await kit.sendTransactionObject(txo, {
    from: kit.defaultAccount,
  });
  await tx.getHash();
  const receipt = await tx.waitReceipt();
  return receipt;
}

export async function settle(
  userId: string,
  transactionId: string,
  value: number
): Promise<TransactionReceipt> {
  const kit = await getKit();
  const celoUBI = await getUBIControllerContract();
  const valueInWei = web3Utils.toWei(`${value}`, "ether");
  const txo = await celoUBI.methods.settle(userId, transactionId, valueInWei);
  const tx = await kit.sendTransactionObject(txo, {
    from: kit.defaultAccount,
  });
  await tx.getHash();
  const receipt = await tx.waitReceipt();
  return receipt;
}

export async function reconcile(): Promise<TransactionReceipt> {
  const kit = await getKit();
  const celoUBI = await getUBIControllerContract();
  const txo = await celoUBI.methods.reconcile();
  const tx = await kit.sendTransactionObject(txo, {
    from: kit.defaultAccount,
  });
  await tx.getHash();
  const receipt = await tx.waitReceipt();
  return receipt;
}

export async function transferOwnership(
  newOwner: string
): Promise<TransactionReceipt> {
  const kit = await getKit();
  const celoUBI = await getUBIControllerContract();
  const txo = await celoUBI.methods.transferOwnership(newOwner);
  const tx = await kit.sendTransactionObject(txo, {
    from: kit.defaultAccount,
  });
  await tx.getHash();
  const receipt = await tx.waitReceipt();
  return receipt;
}

export async function setDisbursementWei(
  disbursementWei: number
): Promise<TransactionReceipt> {
  const kit = await getKit();
  const celoUBI = await getUBIControllerContract();
  const txo = await celoUBI.methods.setDisbursementWei(disbursementWei);
  const tx = await kit.sendTransactionObject(txo, {
    from: kit.defaultAccount,
  });
  await tx.getHash();
  const receipt = await tx.waitReceipt();
  return receipt;
}

export async function getBeneficiaryCount(): Promise<number> {
  const celoUBI = await getUBIControllerContract();
  const count = await celoUBI.methods.getBeneficiaryCount().call();
  return count;
}

export async function getBeneficiaryAddressAtIndex(
  index: number
): Promise<string> {
  const celoUBI = await getUBIControllerContract();
  const address = await celoUBI.methods
    .getBeneficiaryAddressAtIndex(index)
    .call();
  return address;
}

export async function getUBIBeneficiaryForAddress(
  address: string
): Promise<UBIBeneficiary> {
  const ubi = await getBeneficiaryContractFor(address);
  let promises = [
    ubi.methods.userId().call(),
    ubi.methods.createdBlock().call(),
  ];
  let results = await Promise.all(promises);
  const userId = results[0];
  const createdBlock = results[1];

  promises = [
    this.balanceOfUBIBeneficiary(toBytes32(userId)),
    this.authBalanceOfUBIBeneficiary(toBytes32(userId)),
  ];
  results = await Promise.all(promises);
  const balance = parseFloat(web3Utils.fromWei(results[0], "ether"));
  const authBalance = parseFloat(web3Utils.fromWei(results[1], "ether"));

  const user: UBIBeneficiary = {
    userId: userId,
    address: address,
    createdBlock: createdBlock,
    availableBalance: balance,
    pendingAuthorizations: authBalance,
    totalBalance: 0,
  };
  user.totalBalance = user.pendingAuthorizations + user.availableBalance;
  return user;
}

export async function getAuthorizationsForAddress(
  address: string
): Promise<Authorization[]> {
  const ubi = await getBeneficiaryContractFor(address);
  const keys = await ubi.methods.getAuthorizationKeys().call();
  console.log(`keys = ${keys}`);
  const promises = keys.map((key, index) => {
    return ubi.methods.getAuthorizationAtKey(key).call();
  });
  const authorizations = await Promise.all(promises);
  console.log(`authorizations = ${JSON.stringify(authorizations)}`);
  const parsedAuthorizations: Authorization[] = authorizations.map(
    (auth, index) => {
      return {
        transactionId: auth["2"],
        authorizationAmount: parseFloat(web3Utils.fromWei(auth["0"], "ether")),
        deauthorized: auth["1"],
      };
    }
  );
  console.log(`parsedAuthorizations = ${JSON.stringify(parsedAuthorizations)}`);
  return parsedAuthorizations;
}

export async function getSettlementsForAddress(
  address: string
): Promise<Settlement[]> {
  const ubi = await getBeneficiaryContractFor(address);
  const keys = await ubi.methods.getSettlementKeys().call();
  console.log(`keys = ${keys}`);
  const promises = keys.map((key, index) => {
    return ubi.methods.getSettlementAtKey(key).call();
  });
  const settlements = await Promise.all(promises);
  console.log(`settlements = ${JSON.stringify(settlements)}`);
  const parsedSettlements: Settlement[] = settlements.map((settle, index) => {
    return {
      transactionId: settle["1"],
      settlementAmount: parseFloat(web3Utils.fromWei(settle["0"], "ether")),
    };
  });
  console.log(`parsedSettlements = ${JSON.stringify(parsedSettlements)}`);
  return parsedSettlements;
}
