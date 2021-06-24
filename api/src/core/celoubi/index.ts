import * as Kit from "@celo/contractkit";
import { ContractKit } from "@celo/contractkit/lib/kit";
import { Contract } from "@celo/contractkit/node_modules/web3-eth-contract";
import { generateKeys } from "@celo/utils/lib/account";
import { privateKeyToAddress } from "@celo/utils/lib/address";
import { Authorization, Settlement, UBIBeneficiary } from "src/types";
import { TransactionReceipt } from "web3-core";
import * as web3Utils from "web3-utils";
import { toBytes32 } from "src/utils/crypto";
import Wallet from "./artifacts/Wallet.abi.json";
import Controller from "./artifacts/Controller.abi.json";

let kit: ContractKit;

const getKit = async (): Promise<Kit.ContractKit> => {
  if (!kit) {
    console.log("Loading Contract Kit!");
    kit = Kit.newKit(process.env.CELO_UBI_RPC_HOST);
    // await kit.setFeeCurrency(Kit.CeloContract.GoldToken);
    const key = await generateKeys(process.env.CELO_UBI_MNEMONIC);
    kit.addAccount(key.privateKey);
    const account = privateKeyToAddress(key.privateKey);
    console.log("Custodian accounts:", await kit.getWallet().getAccounts());
    kit.defaultAccount = account;
  }
  return kit;
};

const getUBIControllerContract = async (): Promise<Contract> => {
  const kit = await getKit();
  const contract = new kit.web3.eth.Contract(
    Controller as web3Utils.AbiItem[],
    process.env.CELO_UBI_ADDRESS
  );
  return contract;
};

const getBeneficiaryContractFor = async (
  address: string
): Promise<Contract> => {
  const kit = await getKit();
  const contract = new kit.web3.eth.Contract(
    Wallet as web3Utils.AbiItem[],
    address
  );
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
  try {
    const tx = await kit.sendTransactionObject(txo, {
      from: kit.defaultAccount,
    });
    await tx.getHash();
    await tx.waitReceipt();
    return await beneficiaryAddress(toBytes32(userId));
  } catch (err) {
    console.error(txo._method.name, userId, kit.defaultAccount);
    throw err;
  }
}

export async function setCustodian(
  address: string
): Promise<TransactionReceipt> {
  const kit = await getKit();
  const celoUBI = await getUBIControllerContract();
  const txo = await celoUBI.methods.setCustodian(address);
  try {
    const tx = await kit.sendTransactionObject(txo, {
      from: kit.defaultAccount,
    });
    await tx.getHash();
    const receipt = await tx.waitReceipt();
    return receipt;
  } catch (err) {
    console.error(txo._method.name, address, kit.defaultAccount);
    throw err;
  }
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
  try {
    const tx = await kit.sendTransactionObject(txo, {
      from: kit.defaultAccount,
    });
    await tx.getHash();
    const receipt = await tx.waitReceipt();
    return receipt;
  } catch (err) {
    console.error(
      txo._method.name,
      userId,
      transactionId,
      valueInWei,
      kit.defaultAccount
    );
    throw err;
  }
}

export async function deauthorize(
  userId: string,
  transactionId: string
): Promise<TransactionReceipt> {
  const kit = await getKit();
  const celoUBI = await getUBIControllerContract();
  const txo = await celoUBI.methods.deauthorize(userId, transactionId);
  try {
    const tx = await kit.sendTransactionObject(txo, {
      from: kit.defaultAccount,
    });
    await tx.getHash();
    const receipt = await tx.waitReceipt();
    return receipt;
  } catch (err) {
    console.error(txo._method.name, userId, transactionId, kit.defaultAccount);
    throw err;
  }
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
  try {
    const tx = await kit.sendTransactionObject(txo, {
      from: kit.defaultAccount,
    });
    await tx.getHash();
    const receipt = await tx.waitReceipt();
    return receipt;
  } catch (err) {
    console.error(
      txo._method.name,
      userId,
      transactionId,
      valueInWei,
      kit.defaultAccount
    );
    throw err;
  }
}

export async function reconcile(): Promise<TransactionReceipt> {
  const kit = await getKit();
  const celoUBI = await getUBIControllerContract();
  const txo = await celoUBI.methods.reconcile();
  try {
    const tx = await kit.sendTransactionObject(txo, {
      from: kit.defaultAccount,
    });
    await tx.getHash();
    const receipt = await tx.waitReceipt();
    return receipt;
  } catch (err) {
    console.error(txo._method.name, kit.defaultAccount);
    throw err;
  }
}

export async function transferOwnership(
  newOwner: string
): Promise<TransactionReceipt> {
  const kit = await getKit();
  const celoUBI = await getUBIControllerContract();
  const txo = await celoUBI.methods.transferOwnership(newOwner);
  try {
    const tx = await kit.sendTransactionObject(txo, {
      from: kit.defaultAccount,
    });
    await tx.getHash();
    const receipt = await tx.waitReceipt();
    return receipt;
  } catch (err) {
    console.error(txo._method.name, newOwner, kit.defaultAccount);
    throw err;
  }
}

export async function setDisbursementWei(
  disbursementWei: number
): Promise<TransactionReceipt> {
  const kit = await getKit();
  const celoUBI = await getUBIControllerContract();
  const txo = await celoUBI.methods.setDisbursementWei(disbursementWei);
  try {
    const tx = await kit.sendTransactionObject(txo, {
      from: kit.defaultAccount,
    });
    await tx.getHash();
    const receipt = await tx.waitReceipt();
    return receipt;
  } catch (err) {
    console.error(txo._method.name, disbursementWei, kit.defaultAccount);
    throw err;
  }
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
