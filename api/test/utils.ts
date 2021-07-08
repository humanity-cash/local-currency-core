import Web3 from "web3";
import { Contract, SendOptions } from "web3-eth-contract";
import * as web3Utils from "web3-utils";
import { getProvider } from "../src/utils/getProvider";

let sendOptions: SendOptions;
let web3: Web3;
let contractsSetup = false;

export function log(...data: any[]): void {
  if (process.env.DEBUG === "true") console.log(...data);
}

const MINTER_ROLE = web3Utils.keccak256("MINTER_ROLE");

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

  const Wallet = await deployContract("Wallet");
  const Token = await deployContract("Token", ["TestToken", "TT"]);

  const WalletFactory = await deployContract(
    "WalletFactory",
    /*
      constructor
      address _erc20Token
      address _wallet,
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

  // grant controller minter rights
  await Token.methods
    .grantRole(MINTER_ROLE, Controller.options.address)
    .send(sendOptions);

  await Token.methods.renounceRole(MINTER_ROLE, owner).send(sendOptions);

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
    const abi = require(`../src/core/celoubi/artifacts/${name}.abi.json`);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const bytecode = require(`../src/core/celoubi/artifacts/${name}.bin.json`);
    const data = replaceTokens(bytecode, tokens);

    const tempContract = new web3.eth.Contract(abi as web3Utils.AbiItem[]);
    const tx = tempContract.deploy({
      data,
      arguments: args,
    });

    contractInstance = await tx.send(sendOptions);

    log(
      "Deployed",
      name,
      "at",
      contractInstance.options.address,
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
