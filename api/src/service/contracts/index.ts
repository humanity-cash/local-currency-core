import { IWallet } from "src/types";
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
  const code = await web3.eth.getCode(address);
  if (code === "0x") {
    throw new Error(`Wallet not found at: ${address}`);
  }
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
  const address = await controller.methods
    .getWalletAddress(toBytes32(userId))
    .call();
  return address;
}

export async function deposit(
  userId: string,
  amount: string
): Promise<TransactionReceipt> {
  const { sendTransaction } = await getProvider();
  const controller = await getControllerContract();
  const deposit = await controller.methods.deposit(
    toBytes32(userId),
    web3Utils.toWei(amount, "ether")
  );
  const tx = await sendTransaction(deposit);
  return tx;
}

export async function withdraw(
  userId: string,
  amount: string
): Promise<TransactionReceipt> {
  const { sendTransaction } = await getProvider();
  const controller = await getControllerContract();
  const withdraw = await controller.methods.withdraw(
    toBytes32(userId),
    web3Utils.toWei(amount, "ether")
  );
  const tx = await sendTransaction(withdraw);
  return tx;
}

export async function newWallet(userId: string): Promise<string> {
  const { sendTransaction } = await getProvider();
  const controller = await getControllerContract();
  const newWallet = await controller.methods.newWallet(toBytes32(userId));
  await sendTransaction(newWallet);
  return await getWalletAddress(userId);
}

export async function balanceOfWallet(userId: string): Promise<string> {
  const controller = await getControllerContract();
  const balance = await controller.methods
    .balanceOfWallet(toBytes32(userId))
    .call();
  return balance;
}

export async function transferWalletOwnership(
  newOwner: string,
  userId: string
): Promise<TransactionReceipt> {
  const { sendTransaction } = await getProvider();
  const controller = await getControllerContract();
  const transferWalletOwnership =
    await controller.methods.transferWalletOwnership(
      newOwner,
      toBytes32(userId)
    );
  return await sendTransaction(transferWalletOwnership);
}

export async function transferTo(
  fromUserId: string,
  toUserId: string,
  amount: string
): Promise<TransactionReceipt> {
  const { sendTransaction } = await getProvider();
  const controller = await getControllerContract();
  const transferContractOwnership = await controller.methods.transferTo(
    toBytes32(fromUserId),
    toBytes32(toUserId),
    web3Utils.toWei(amount, "ether")
  );
  return await sendTransaction(transferContractOwnership);
}

export async function transferContractOwnership(
  newOwner: string
): Promise<TransactionReceipt> {
  const { sendTransaction } = await getProvider();
  const controller = await getControllerContract();
  const transferContractOwnership =
    await controller.methods.transferContractOwnership(newOwner);
  return await sendTransaction(transferContractOwnership);
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

  console.log("Found wallet contract for userId " + userId);

  const controller = await getControllerContract();
  const b = await controller.methods.balanceOfWallet(userId).call();
  console.log(b);
  const balance = parseFloat(web3Utils.fromWei(b, "ether"));

  const user: IWallet = {
    userId: userId,
    address: address,
    createdBlock: createdBlock,
    availableBalance: balance,
    totalBalance: 0,
  };
  return user;
}
