import { Contract, SendOptions } from "web3-eth-contract";
// @ts-ignore
import path from "path";
import { getKit } from "../src/utils/getKit";
import { ContractKit } from "@celo/contractkit/lib/kit";
import * as web3Utils from "web3-utils";
import Web3 from "web3";
import { generateKeys } from "@celo/utils/lib/account";
import { privateKeyToAddress } from "@celo/utils/lib/address";

let sendOptions: SendOptions;
let kit: ContractKit;
let web3: Web3;

export function log(...data: any[]): void {
  if (process.env.DEBUG === "true") console.log(data);
}

export async function setupContracts(): Promise<void> {
  kit = await getKit();
  web3 = new Web3(process.env.LOCAL_CURRENCY_RPC_HOST);

  const key = await generateKeys(
    process.env.LOCAL_CURRENCY_MNEMONIC,
    undefined,
    undefined,
    undefined,
    undefined,
    test ? "m/44'/60'/0'" : undefined
  );
  kit.addAccount(key.privateKey);
  const account = privateKeyToAddress(key.privateKey);
  console.log("Test accounts:", await kit.getWallet().getAccounts());
  kit.defaultAccount = account;

  sendOptions = {
    from: kit.defaultAccount,
    gas: 6721975,
    gasPrice: "10000",
  };

  const Token = await deployContract("ERC20", ["TestToken", "TT"]);
  const Wallet = await deployContract("Wallet");

  const WalletFactory = await deployContract(
    "WalletFactory",
    /*
      constructor
      IWallet _wallet,
      IERC20 _erc20Token
     */
    [Wallet.options.address, Token.options.address]
  );

  const Controller = await deployContract(
    "Controller",
    /*
      constructor
      address _erc20Token,
      address _walletFactory
     */
    [Token.options.address, WalletFactory.options.address]
  );

  process.env.LOCAL_CURRENCY_ADDRESS = Controller.options.address;
}

async function deployContract(
  name: string,
  args: any[] = [],
  tokens: { [name: string]: string } = {}
): Promise<Contract> {
  let contractInstance;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const abi = require(`../src/service/contracts/artifacts/${name}.abi.json`);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const bytecode = require(`../src/service/contracts/artifacts/${name}.bin.json`);

    const tempContract = new web3.eth.Contract(abi as web3Utils.AbiItem[]);
    const isZos = !!tempContract.methods.initialize;
    const data = replaceTokens(bytecode, tokens);
    const tx = tempContract.deploy({
      data,
      arguments: isZos ? undefined : args,
    });

    contractInstance = await tx.send(sendOptions);

    log("Deployed", name, "at", contractInstance.options.address, isZos);
  } catch (err) {
    console.error(
      "Deployment failed for",
      name,
      "with args",
      JSON.stringify(args, null, 2),
      err.message
    );
    throw err;
  }

  return contractInstance;
}

function replaceTokens(
  bytecode: string,
  tokens: { [name: string]: string }
): string {
  return Object.entries(tokens).reduce(
    (acc, [token, address]) =>
      acc.replace(new RegExp(`_+${token}_+`, "g"), address.substr(2)),
    bytecode
  );
}
