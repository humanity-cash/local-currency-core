import * as Kit from "@celo/contractkit";
import { generateKeys } from "@celo/utils/lib/account";
import { privateKeyToAddress } from "@celo/utils/lib/address";
import { ContractKit } from "@celo/contractkit/lib/kit";
import Web3 from "web3";
import { TransactionReceipt } from "web3-core";
import { log } from "src/utils";

let kit: ContractKit;
let web3: Web3;

const addKeysFromMnemonic = async (
  kit: ContractKit,
  mnemonic: string,
  index: number
): Promise<string> => {
  const key = await generateKeys(
    mnemonic,
    undefined,
    undefined,
    index,
    undefined,
    process.env.DERIVATION_PATH
  );
  kit.addAccount(key.privateKey);
  const account = privateKeyToAddress(key.privateKey);
  log(`Added account ${account} at index ${index}`);
  return account;
};

const getKit = async (): Promise<ContractKit> => {
  if (!kit) {
    log("Loading Contract Kit!");
    kit = Kit.newKit(process.env.LOCAL_CURRENCY_RPC_HOST);

    // Add Deployer/controller
    const deployer = await addKeysFromMnemonic(
      kit,
      process.env.LOCAL_CURRENCY_MNEMONIC,
      parseInt(process.env.LOCAL_CURRENCY_MNEMONIC_INDEX)
    );

    // Add as many operators (bank) as configured
    
    // These operators must already be preconfigured in Dwolla
    // and the environment variables:

    // OPERATOR_<N>_MNEMONIC
    // OPERATOR_<N>_MNEMONIC_INDEX
    // OPERATOR_<N>_DISPLAY_NAME

    // ... available to this environment

    for(let i = 0;i < parseInt(process.env.NUMBER_OPERATORS); i++){
      await addKeysFromMnemonic(kit, process.env[`OPERATOR_${i}_MNEMONIC`], parseInt(process.env[`OPERATOR_${i}_MNEMONIC_INDEX`]));
    }

    log("Accounts:", kit.getWallet().getAccounts());
    kit.defaultAccount = deployer;
  }
  return kit;
};

const getWeb3 = (): Web3 => {
  if (!web3) {
    log("Loading web3!");
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

export const getProvider = async (
  accountToUse?: string
): Promise<{
  web3: Web3;
  sendTransaction: { (txo): Promise<TransactionReceipt> };
  defaultAccount: string;
  operators: string[];
}> => {
  let defaultAccount, web3: Web3, kit: ContractKit, operators: string[];

  if (process.env.LOCAL_CURRENCY_PROVIDER === "web3") {
    // If web3 isn't defined or the accountToUse has been specified
    if (!web3 || accountToUse) {
      web3 = getWeb3();
      const accounts = await web3.eth.getAccounts();
      defaultAccount = accountToUse ? accountToUse : accounts[0];
      operators = accounts.filter((value, index) => {
        return index > 0 && index <= parseInt(process.env.NUMBER_OPERATORS);
      });
      // log(
      //   "(web3) Now using account:",
      //   defaultAccount,
      //   " for this transaction"
      // );
      // log("(web3) Operators", operators);
    }
  } else {
    // If kit isn't defined or the accountToUse has been specified
    if (!kit || accountToUse) {
      kit = await getKit();
      const accounts = await kit.getWallet().getAccounts();
      kit.defaultAccount = accountToUse ? accountToUse : accounts[0];
      defaultAccount = kit.defaultAccount;
      operators = accounts.filter((value, index) => {
        return index > 0 && index <= parseInt(process.env.NUMBER_OPERATORS);
      });
      // log(
      //   "(kit) Now using account:",
      //   defaultAccount,
      //   " for this transaction"
      // );
      // log("(kit) Operators", operators);
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
      log(
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
    operators,
  };
};
