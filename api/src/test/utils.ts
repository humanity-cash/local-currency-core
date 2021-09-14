import { Contract, SendOptions } from "web3-eth-contract";
import { getProvider } from "../utils/getProvider";
import * as web3Utils from "web3-utils";
import Web3 from "web3";
import { DwollaEvent } from "../service/digital-banking/DwollaTypes";
import { v4 } from "uuid";
import { INewUser } from "../types";
import faker from "faker";
import { cryptoUtils, log } from "../utils";

let sendOptions: SendOptions;
let web3: Web3;
let contractsSetup = false;

const MINTER_ROLE = web3Utils.keccak256("MINTER_ROLE");
const OPERATOR_ROLE = web3Utils.keccak256("OPERATOR_ROLE");

export function getSalt(): string {
  return new Date().getTime().toString();
}

export function createFakeUser(isBusiness = false): INewUser {
  const user: INewUser = {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    address1: faker.address.streetAddress(),
    address2: faker.address.secondaryAddress(),
    city: faker.address.city(),
    postalCode: faker.address.zipCode(),
    state: faker.address.stateAbbr(),
    email: getSalt() + faker.internet.email(),
    ipAddress: faker.internet.ip().toString(),
    authUserId: "",
    businessName: isBusiness
      ? faker.name.lastName() + "'s fake business"
      : undefined,
  };
  user.authUserId =
    (isBusiness ? "m_" : "p_") + cryptoUtils.toBytes32(user.email);
  log(user);
  return user;
}

export function createDummyEvent(topic: string, id: string): DwollaEvent {
  const eventId = v4();
  const accountId = "0ee84069-47c5-455c-b425-633523291dc3";

  return {
    _links: {
      account: {
        href: `https://api-sandbox.dwolla.com/accounts/${accountId}`,
        "resource-type": "account",
        type: "application/vnd.dwolla.v1.hal+json",
      },
      customer: {
        href: `https://api-sandbox.dwolla.com/customers/${id}`,
        "resource-type": "customer",
        type: "application/vnd.dwolla.v1.hal+json",
      },
      resource: {
        href: `https://api-sandbox.dwolla.com/customers/${id}`,
        type: "application/vnd.dwolla.v1.hal+json",
      },
      self: {
        href: `https://api-sandbox.dwolla.com/events/${eventId}`,
        "resource-type": "event",
        type: "application/vnd.dwolla.v1.hal+json",
      },
    },
    created: Date.now().toString(),
    id: eventId,
    resourceId: id,
    topic: topic,
  };
}

export async function setupContracts(): Promise<void> {
  if (contractsSetup) return;

  const provider = await getProvider();
  web3 = provider.web3;
  const owner = provider.defaultAccount;

  sendOptions = {
    from: owner,
    gas: (await web3.eth.getBlock("latest")).gasLimit,
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
  log("Controller deployed: ", Controller.options.address);

  const { operators } = await getProvider();
  for (let i = 0; i < operators.length; i++) {
    await Controller.methods
      .grantRole(OPERATOR_ROLE, operators[i])
      .send(sendOptions);
    log(
      `Added operator ${operators[i]} to list of OPERATOR_ROLE in the Controller contract`
    );
  }

  // Make controller own factory
  await WalletFactory.methods
    .transferOwnership(Controller.options.address)
    .send(sendOptions);
  log("Factory ownership transferred...");

  // grant controller minter rights
  await Token.methods
    .grantRole(MINTER_ROLE, Controller.options.address)
    .send(sendOptions);
  log("Token MINTER_ROLE granted to ", Controller.options.address);

  await Token.methods.renounceRole(MINTER_ROLE, owner).send(sendOptions);
  log("Token MINTER_ROLE revoked from ", owner);

  process.env.LOCAL_CURRENCY_ADDRESS = Controller.options.address;

  log("Controller Address:", Controller.options.address);
  contractsSetup = true;
}

async function deployContract(
  name: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: any[] = [],
  tokens: { [name: string]: string } = {}
): Promise<Contract> {
  let contractInstance;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const abi = require(`../service/contracts/artifacts/${name}.abi.json`);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const bytecode = require(`../service/contracts/artifacts/${name}.bin.json`);
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
    log(
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
