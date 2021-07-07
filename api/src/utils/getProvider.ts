import * as Kit from "@celo/contractkit";
import { generateKeys } from "@celo/utils/lib/account";
import { privateKeyToAddress } from "@celo/utils/lib/address";
import { ContractKit } from "@celo/contractkit/lib/kit";
import Web3 from "web3";
import { TransactionReceipt } from "web3-core";

let kit: ContractKit;
let web3: Web3;

const getKit = async (): Promise<ContractKit> => {
  if (!kit) {
    console.log("Loading Contract Kit!");
    kit = Kit.newKit(process.env.LOCAL_CURRENCY_RPC_HOST);
    // await kit.setFeeCurrency(Kit.CeloContract.GoldToken);
    const key = await generateKeys(process.env.LOCAL_CURRENCY_MNEMONIC);
    kit.addAccount(key.privateKey);
    const account = privateKeyToAddress(key.privateKey);
    console.log("Custodian accounts:", await kit.getWallet().getAccounts());
    kit.defaultAccount = account;
  }
  return kit;
};

const getWeb3 = (): Web3 => {
  if (!web3) {
    console.log("Loading web3!");
    const host = process.env.LOCAL_CURRENCY_RPC_HOST;
    web3 = new Web3(
      host && host.startsWith("http")
        ? new Web3.providers.HttpProvider(host, {
            keepAlive: false,
          })
        : new Web3.providers.WebsocketProvider(host)
    );
  }
  return web3;
};

export const getProvider = async (): Promise<{
  web3: Web3;
  sendTransaction: { (txo): Promise<TransactionReceipt> };
  defaultAccount: string;
}> => {
  let defaultAccount, web3: Web3, kit: ContractKit;

  if (process.env.LOCAL_CURRENCY_PROVIDER === "web3") {
    if (!web3) {
      web3 = getWeb3();
      const accounts = await web3.eth.getAccounts();
      defaultAccount = accounts[0];
      console.log("Default account:", defaultAccount);
    }
  } else {
    if (!kit) {
      kit = await getKit();
      defaultAccount = kit.defaultAccount;
    }
  }

  const sendTransaction = async (txo): Promise<TransactionReceipt> => {
    try {
      if (kit) {
        const tx = await kit.sendTransactionObject(txo, {
          from: defaultAccount,
        });
        await tx.getHash();
        return await tx.waitReceipt();
      } else if (web3) {
        const gas = await txo.estimateGas({ from: defaultAccount });
        return await txo.send({
          from: defaultAccount,
          gas,
        });
      }
    } catch (err) {
      console.error(
        "Transaction failed!",
        err.message,
        txo._method.name,
        ...txo.arguments,
        "from:",
        defaultAccount
      );
      throw err;
    }
  };

  return {
    web3: web3 || kit.web3,
    sendTransaction,
    defaultAccount,
  };
};
