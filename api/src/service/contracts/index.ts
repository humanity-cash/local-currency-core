import {
  IWallet,
  ITransferEvent,
  IOperatorTotal,
  IWithdrawal,
  IDeposit,
} from "src/types";
import { toBytes32, getTimestampForBlock } from "src/utils/crypto";
import Wallet from "./artifacts/Wallet.abi.json";
import Controller from "./artifacts/Controller.abi.json";
import { getProvider } from "src/utils/getProvider";
import { Contract, EventData } from "web3-eth-contract";
import { TransactionReceipt, PastLogsOptions } from "web3-core";
import * as web3Utils from "web3-utils";
import BN from "bn.js";

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
  amount: string,
  operator?: string
): Promise<TransactionReceipt> {
  const { sendTransaction } = await getProvider(operator);
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
  amount: string,
  operator?: string
): Promise<TransactionReceipt> {
  const { sendTransaction } = await getProvider(operator);
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
  const transfer = await controller.methods.transfer(
    toBytes32(fromUserId),
    toBytes32(toUserId),
    web3Utils.toWei(amount, "ether")
  );
  return await sendTransaction(transfer);
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

async function getLogs(
  eventName: string,
  contract: Contract,
  options: PastLogsOptions
): Promise<EventData[]> {
  const events: EventData[] = await contract.getPastEvents(eventName, options);
  return events;
}

async function getFundingEvent(
  eventName: string,
  options: PastLogsOptions
): Promise<IWithdrawal[] | IDeposit[]> {
  const response = [];
  try {
    const controller = await getControllerContract();
    const events = await getLogs(eventName, controller, options);
    const obj = JSON.parse(JSON.stringify(events));

    for (let i = 0; i < obj.length; i++) {
      const element = obj[i];
      response.push({
        operator: element.returnValues._operator,
        userId: element.returnValues._userId,
        value: element.returnValues._value,
        transactionHash: element.transactionHash,
        blockNumber: element.blockNumber,
        timestamp: await getTimestampForBlock(element.blockNumber),
      });
    }
  } catch (e) {
    throw new Error(
      `Problem collating and parsing ${eventName} events (${JSON.stringify(e)})`
    );
  }
  return response;
}

export async function getDeposits(
  options?: PastLogsOptions
): Promise<IDeposit[]> {
  return await getFundingEvent("UserDeposit", options);
}

export async function getWithdrawals(
  options?: PastLogsOptions
): Promise<IWithdrawal[]> {
  return await getFundingEvent("UserWithdrawal", options);
}

// Deposit events are emitted from the controller contract
// We need to filter on the userId
export async function getDepositsForUser(userId: string): Promise<IDeposit[]> {
  const options = {
    filter: { _userId: toBytes32(userId) },
    fromBlock: 0,
    toBlock: "latest",
  };
  const deposits: IDeposit[] = await getDeposits(options);
  console.log(`UserDeposit logs: ${JSON.stringify(deposits, null, 2)}`);
  return deposits;
}

// Withdrawal events are emitted from the controller contract
// We need to filter on the userId
export async function getWithdrawalsForUser(
  userId: string
): Promise<IWithdrawal[]> {
  const options = {
    filter: { _userId: toBytes32(userId) },
    fromBlock: 0,
    toBlock: "latest",
  };
  const withdrawals: IWithdrawal[] = await getWithdrawals(options);
  console.log(`UserWithdrawal logs: ${JSON.stringify(withdrawals, null, 2)}`);
  return withdrawals;
}

// Transfer events are emitted from the user's wallet
// Therefore use the user's wallet contract as the event source
// We don't need to filter since only events relating
// to that wallet will be emitted
export async function getTransfersForUser(
  userId: string
): Promise<ITransferEvent[]> {
  const transfers: ITransferEvent[] = [];
  const userAddress = await getWalletAddress(userId);
  console.log(`Using address ${userAddress} for userId ${toBytes32(userId)}`);
  const userWallet = await getWalletContractFor(userAddress);

  const options = {
    filter: { _fromUserId: toBytes32(userId) },
    fromBlock: 0,
    toBlock: "latest",
  };
  const logs = await getLogs("TransferToEvent", userWallet, options);
  const obj = JSON.parse(JSON.stringify(logs));
  console.log(`TransferToEvent logs: ${JSON.stringify(obj, null, 2)}`);

  for (let i = 0; i < logs.length; i++) {
    const element = logs[i];

    let toUserId, toAddress;
    if (element.returnValues._toUserId) {
      toUserId = element.returnValues._toUserId;
      toAddress = getWalletAddress(toUserId);
    } else {
      toAddress = element.returnValues._toAddress;
      const wallet = await getWalletContractFor(toAddress);
      const userId = await wallet.methods.userId().call();
      toUserId = userId;
    }

    const fromAddress = await getWalletAddress(
      element.returnValues._fromUserId
    );
    const timestamp = await getTimestampForBlock(element.blockNumber);

    transfers.push({
      fromUserId: element.returnValues._fromUserId,
      fromAddress: fromAddress,
      toUserId: toUserId,
      toAddress: toAddress,
      value: element.returnValues._amt,
      transactionHash: element.transactionHash,
      blockNumber: element.blockNumber,
      timestamp: timestamp,
    });
  }

  return transfers;
}

export async function getFundingStatus(): Promise<IOperatorTotal[]> {
  const options: PastLogsOptions = {
    fromBlock: 0,
    toBlock: "latest",
  };
  const deposits = await getDeposits(options);
  const withdrawals = await getWithdrawals(options);
  const { operators } = await getProvider();

  console.log(JSON.stringify(deposits));
  console.log(JSON.stringify(withdrawals));

  const operatorTotals: IOperatorTotal[] = [];

  for (let i = 0; i < operators?.length; i++) {
    let totalDeposits: BN = new BN(0);
    let totalWithdrawals: BN = new BN(0);
    let currentOutstanding: BN = new BN(0);

    const depositsForOperator = deposits.filter((value, index) => {
      return value.operator === operators[i];
    });
    const withdrawalsForOperator = withdrawals.filter((value, index) => {
      return value.operator === operators[i];
    });

    for (let j = 0; j < depositsForOperator?.length; j++) {
      totalDeposits = totalDeposits.add(new BN(depositsForOperator[j].value));
    }
    for (let j = 0; j < withdrawalsForOperator?.length; j++) {
      totalWithdrawals = totalWithdrawals.add(
        new BN(withdrawalsForOperator[j].value)
      );
    }

    currentOutstanding = totalDeposits.sub(totalWithdrawals);

    operatorTotals.push({
      operator: operators[i],
      totalDeposits: web3Utils.fromWei(totalDeposits.toString()),
      totalWithdrawals: web3Utils.fromWei(totalWithdrawals.toString()),
      currentOutstanding: web3Utils.fromWei(currentOutstanding.toString()),
      deposits: depositsForOperator,
      withdrawals: withdrawalsForOperator,
    });
  }

  return operatorTotals;
}
