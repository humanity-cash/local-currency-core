import { Contract, SendOptions } from "web3-eth-contract";
// @ts-ignore
import path from "path";
import { getProvider } from "../src/utils/getProvider";
import * as web3Utils from "web3-utils";
import Web3 from "web3";

let sendOptions: SendOptions;
let web3: Web3;
let contractsSetup = false;

export function log(...data: any[]): void {
  if (process.env.DEBUG === "true") console.log(...data);
}

export async function setupContracts(): Promise<void> {
  if (contractsSetup) return;

  const provider = await getProvider();
  web3 = provider.web3;
  const owner = provider.defaultAccount;

  sendOptions = {
    from: owner,
    gas: 6721975,
    gasPrice: "10000",
  };

  const Token = await deployContract("ERC20", ["TestToken", "TT"]);
  const Wallet = await deployContract("Wallet");

  const WalletFactory = await deployContract(
    "WalletFactory",
    /*
      constructor
      IERC20 _erc20Token
      IWallet _wallet,
     */
    [Token.options.address, Wallet.options.address]
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

  // Make controller own factory
  await WalletFactory.methods
    .transferOwnership(Controller.options.address)
    .send(sendOptions);

  process.env.LOCAL_CURRENCY_ADDRESS = Controller.options.address;

  console.log("Controller Address:", Controller.options.address);
  contractsSetup = true;
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

    log(
      "Deployed",
      name,
      "at",
      contractInstance.options.address,
      "isZos:",
      isZos,
      "args:",
      args,
      "from:",
      sendOptions.from
    );
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
