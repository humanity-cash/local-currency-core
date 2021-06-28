import { Settlement, IWallet } from "src/types";
import { TransactionReceipt } from "web3-core";
import * as web3Utils from "web3-utils";
import { toBytes32 } from "src/utils/crypto";
import Wallet from "./artifacts/Wallet.abi.json";
import Controller from "./artifacts/Controller.abi.json";
import { getProvider } from "src/utils/getProvider";
import { Contract } from "web3-eth-contract";

const getControllerContract = async (): Promise<Contract> => {
  const { web3 } = await getProvider();
  const controller = new web3.eth.Contract(
    Controller as web3Utils.AbiItem[],
    process.env.LOCAL_CURRENCY_ADDRESS
  );
  return controller;
};

const getWalletContractFor = async (address: string): Promise<Contract> => {
  const { web3 } = await getProvider();
  const wallet = new web3.eth.Contract(Wallet as web3Utils.AbiItem[], address);
  return wallet;
};

export async function owner(): Promise<string> {
  const controller = await getControllerContract();
  const owner = await controller.methods.owner().call();
  return owner;
}

export async function walletFactory(): Promise<string> {
  const controller = await getControllerContract();
  const walletFactory = await controller.methods.walletFactory().call();
  return walletFactory;
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
  const { defaultAccount, sendTransaction } = await getProvider();
  const controller = await getControllerContract();
  const newWallet = await controller.methods.newWallet(userId);
  try {
    await sendTransaction(newWallet);
  } catch (err) {
    console.error(newWallet._method.name, userId, defaultAccount, err.message);
    throw err;
  }
  return await getWalletAddress(toBytes32(userId));
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
  const { sendTransaction, defaultAccount } = await getProvider();
  const controller = await getControllerContract();
  const valueInWei = web3Utils.toWei(`${value}`, "ether");
  const settle = await controller.methods.settle(
    userId,
    transactionId,
    valueInWei
  );
  try {
    return await sendTransaction(settle);
  } catch (err) {
    console.error(
      settle._method.name,
      userId,
      transactionId,
      valueInWei,
      defaultAccount
    );
    throw err;
  }
}

export async function reconcile(): Promise<TransactionReceipt> {
  const { sendTransaction, defaultAccount } = await getProvider();
  const controller = await getControllerContract();
  const reconcile = await controller.methods.reconcile();
  try {
    return await sendTransaction(reconcile);
  } catch (err) {
    console.error(reconcile._method.name, defaultAccount);
    throw err;
  }
}

export async function transferWalletOwnership(
  newOwner: string,
  userId: string
): Promise<TransactionReceipt> {
  const { sendTransaction, defaultAccount } = await getProvider();
  const controller = await getControllerContract();
  const transferWalletOwnership = await controller.methods.transferWalletOwnership(
    newOwner,
    userId
  );
  try {
    return await sendTransaction(transferWalletOwnership);
  } catch (err) {
    console.error(
      transferWalletOwnership._method.name,
      newOwner,
      userId,
      defaultAccount
    );
    throw err;
  }
}

export async function transferContractOwnership(
  newOwner: string
): Promise<TransactionReceipt> {
  const { sendTransaction, defaultAccount } = await getProvider();
  const controller = await getControllerContract();
  const transferContractOwnership = await controller.methods.transferContractOwnership(
    newOwner
  );
  try {
    return await sendTransaction(transferContractOwnership);
  } catch (err) {
    console.error(
      transferContractOwnership._method.name,
      newOwner,
      defaultAccount
    );
    throw err;
  }
}

export async function getWalletCount(): Promise<number> {
  const controller = await getControllerContract();
  const count = await controller.methods.getWalletCount().call();
  return Number(count);
}

export async function getWalletAddressAtIndex(index: number): Promise<string> {
  const controller = await getControllerContract();
  const address = await controller.methods
    .getWalletAddressAtIndex(index)
    .call();
  return address;
}

export async function getWalletForAddress(address: string): Promise<IWallet> {
  const wallet = await getWalletContractFor(address);
  const [userId, createdBlock] = await Promise.all([
    wallet.methods.userId().call(),
    wallet.methods.createdBlock().call(),
  ]);

  const balance = parseFloat(
    web3Utils.fromWei(await this.balanceOfWallet(toBytes32(userId)), "ether")
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
  const wallet = await getWalletContractFor(address);
  const keys = await wallet.methods.getSettlementKeys().call();
  console.log(`keys = ${keys}`);

  const settlements = await Promise.all(
    keys.map((key) => {
      return wallet.methods.getSettlementAtKey(key).call();
    })
  );
  console.log(`settlements = ${JSON.stringify(settlements)}`);

  const parsedSettlements: Settlement[] = settlements.map((settle) => {
    return {
      transactionId: settle["1"],
      settlementAmount: parseFloat(web3Utils.fromWei(settle["0"], "ether")),
    };
  });
  console.log(`parsedSettlements = ${JSON.stringify(parsedSettlements)}`);

  return parsedSettlements;
}
