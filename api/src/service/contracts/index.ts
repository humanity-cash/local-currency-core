import { Settlement, IWallet } from "src/types";
import { TransactionReceipt } from "web3-core";
import * as web3Utils from "web3-utils";
import { toBytes32 } from "src/utils/crypto";
import Wallet from "./artifacts/Wallet.abi.json";
import Controller from "./artifacts/Controller.abi.json";
import { getKit } from "src/utils/getKit";
import { Contract } from "web3-eth-contract";
import { ContractKit } from "@celo/contractkit/lib/kit";

const getControllerContract = async (): Promise<Contract> => {
  const kit: ContractKit = await getKit();
  const contract = new kit.web3.eth.Contract(
    Controller as web3Utils.AbiItem[],
    process.env.LOCAL_CURRENCY_ADDRESS
  );
  return contract;
};

const getWalletContractFor = async (address: string): Promise<Contract> => {
  const kit = await getKit();
  const contract = new kit.web3.eth.Contract(
    Wallet as web3Utils.AbiItem[],
    address
  );
  return contract;
};

export async function owner(): Promise<string> {
  const controller = await getControllerContract();
  const owner = await controller.methods.owner().call();
  return owner;
}

export async function token(): Promise<string> {
  const controller = await getControllerContract();
  const token = await controller.methods.erc20Token().call();
  return token;
}

export async function getWalletAddress(userId: string): Promise<string> {
  const controller = await getControllerContract();
  const address = await controller.methods.getWalletAddress(userId).call();
  return address;
}

export async function newWallet(userId: string): Promise<string> {
  const kit = await getKit();
  const controller = await getControllerContract();
  const txo = await controller.methods.newWallet(userId);
  try {
    const tx = await kit.sendTransactionObject(txo, {
      from: kit.defaultAccount,
    });
    await tx.getHash();
    await tx.waitReceipt();
    return await getWalletAddress(toBytes32(userId));
  } catch (err) {
    console.error(txo._method.name, userId, kit.defaultAccount, err);
    throw err;
  }
}

export async function balanceOfWallet(userId: string): Promise<string> {
  const controller = await getControllerContract();
  const balance = await controller.methods.balanceOfWallet(userId).call();
  return balance;
}

export async function settle(
  userId: string,
  transactionId: string,
  value: number
): Promise<TransactionReceipt> {
  const kit = await getKit();
  const controller = await getControllerContract();
  const valueInWei = web3Utils.toWei(`${value}`, "ether");
  const txo = await controller.methods.settle(
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

export async function reconcile(): Promise<TransactionReceipt> {
  const kit = await getKit();
  const controller = await getControllerContract();
  const txo = await controller.methods.reconcile();
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
  const controller = await getControllerContract();
  const txo = await controller.methods.transferOwnership(newOwner);
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

export async function getWalletCount(): Promise<number> {
  const controller = await getControllerContract();
  const count = await controller.methods.getWalletCount().call();
  return count;
}

export async function getWalletAddressAtIndex(index: number): Promise<string> {
  const controller = await getControllerContract();
  const address = await controller.methods
    .getWalletAddressAtIndex(index)
    .call();
  return address;
}

export async function getWalletForAddress(address: string): Promise<IWallet> {
  const ubi = await getWalletContractFor(address);
  const promises = [
    ubi.methods.userId().call(),
    ubi.methods.createdBlock().call(),
  ];
  const results = await Promise.all(promises);
  const userId = results[0];
  const createdBlock = results[1];

  const balance = parseFloat(
    web3Utils.fromWei(await this.wallet(toBytes32(userId)), "ether")
  );

  const user: IWallet = {
    userId: userId,
    address: address,
    createdBlock: createdBlock,
    availableBalance: balance,
    totalBalance: 0,
  };
  return user;
}

export async function getSettlementsForAddress(
  address: string
): Promise<Settlement[]> {
  const ubi = await getWalletContractFor(address);
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
