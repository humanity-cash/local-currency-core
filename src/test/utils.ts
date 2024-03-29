import * as faker from "faker";
import {
  createFundingSource,
  createPersonalVerifiedCustomer,
  getFundingSourceLinkForUser,
  initiateMicroDepositsForTestUser,
  verifyMicroDepositsForTestUser,
} from "src/service/digital-banking/DwollaService";
import {
  getAppToken,
  getIdempotencyHeader,
} from "src/service/digital-banking/DwollaUtils";
import { Business, Customer, IAPINewUser } from "src/types";
import { v4 } from "uuid";
import Web3 from "web3";
import { Contract, SendOptions } from "web3-eth-contract";
import * as web3Utils from "web3-utils";
import {
  DwollaEvent,
  DwollaFundingSourceRequest,
  DwollaPersonalVerifiedCustomerRequest,
} from "../service/digital-banking/DwollaTypes";
import { log, sleep } from "../utils";
import { getProvider } from "../utils/getProvider";

let sendOptions: SendOptions;
let web3: Web3;
let contractsSetup = false;

const MINTER_ROLE = web3Utils.keccak256("MINTER_ROLE");
// const OPERATOR_ROLE = web3Utils.keccak256("OPERATOR_ROLE");

export function getSalt(): string {
  return new Date().getTime().toString();
}

export function newBusinessData(): Business {
  return {
    avatar: "businessavatar",
    tag: "businesstag",
    address1: faker.address.streetAddress(),
    address2: faker.address.secondaryAddress(),
    city: faker.address.city(),
    state: faker.address.state(),
    postalCode: faker.address.zipCode(),
    story: faker.lorem.paragraph(),
    type: "type",
    rbn: faker.company.companyName(),
    ssn: faker.random.alphaNumeric(),
    industry: faker.commerce.department(),
    ein: faker.random.alphaNumeric(),
    phoneNumber: faker.phone.phoneNumber(),
    owner: {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      address1: faker.address.streetAddress(),
      address2: faker.address.secondaryAddress(),
      city: faker.address.city(),
      state: faker.address.state(),
      postalCode: faker.address.zipCode(),
    },
  };
}

export function newCustomerData(): Customer {
  return {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    address1: faker.address.streetAddress(),
    address2: faker.address.secondaryAddress(),
    city: faker.address.city(),
    state: faker.address.state(),
    postalCode: faker.address.zipCode(),
    avatar: faker.image.avatar(),
    tag: faker.name.title(),
  };
}

export function createFakeUser(isBusiness = false): IAPINewUser {
  const newBusinessInput: IAPINewUser = {
    consent: true,
    email: getSalt() + faker.internet.email(),
    type: "business",
    business: newBusinessData(),
  };
  const newCustomerInput: IAPINewUser = {
    consent: true,
    email: getSalt() + faker.internet.email(),
    type: "customer",
    customer: newCustomerData(),
  };

  const user = isBusiness ? newBusinessInput : newCustomerInput;
  log(user);
  return user;
}

export async function createOperatorsForTest(): Promise<void> {
  // Operator 1
  let firstName = "Operator 1 - " + faker.name.firstName();
  let lastName = faker.name.lastName();
  let address1 = faker.address.streetAddress();
  let address2 = faker.address.secondaryAddress();
  let city = faker.address.city();
  let postalCode = faker.address.zipCode();
  let state = faker.address.stateAbbr();
  let email = getSalt() + faker.internet.email();
  let dateOfBirth = "1970-01-01";
  let type = "personal";
  let ssn = faker.datatype.number(9999).toString();

  const operator1: DwollaPersonalVerifiedCustomerRequest = {
    firstName,
    lastName,
    email,
    type,
    address1,
    address2,
    city,
    state,
    postalCode,
    dateOfBirth,
    ssn,
  };
  const operatorResponse1 = await createPersonalVerifiedCustomer(operator1);
  await createFundingSourceForTest(operatorResponse1.userId);
  const fundingSourceLink1 = await getFundingSourceLinkForUser(
    operatorResponse1.userId
  );
  process.env.OPERATOR_1_FUNDING_SOURCE = fundingSourceLink1;

  // Operator 2
  firstName = "Operator 2 - " + faker.name.firstName();
  lastName = faker.name.lastName();
  address1 = faker.address.streetAddress();
  address2 = faker.address.secondaryAddress();
  city = faker.address.city();
  postalCode = faker.address.zipCode();
  state = faker.address.stateAbbr();
  email = getSalt() + faker.internet.email();
  dateOfBirth = "1970-01-01";
  type = "personal";
  ssn = faker.datatype.number(9999).toString();

  const operator2: DwollaPersonalVerifiedCustomerRequest = {
    firstName,
    lastName,
    email,
    type,
    address1,
    address2,
    city,
    state,
    postalCode,
    dateOfBirth,
    ssn,
  };
  const operatorResponse2 = await createPersonalVerifiedCustomer(operator2);
  await createFundingSourceForTest(operatorResponse2.userId);
  const fundingSourceLink2 = await getFundingSourceLinkForUser(
    operatorResponse2.userId
  );
  process.env.OPERATOR_2_FUNDING_SOURCE = fundingSourceLink2;
}

export async function processDwollaSandboxSimulations(): Promise<void> {
  const appToken = await getAppToken();
  const result = await appToken.post(
    process.env.DWOLLA_BASE_URL + "sandbox-simulations",
    { headers: getIdempotencyHeader() }
  );
  log(
    `utils.ts::processDwollaSandboxSimulations, processed ${JSON.stringify(
      result,
      null,
      2
    )}`
  );
}

export async function createFundingSourceForTest(
  userId: string
): Promise<void> {
  const fundingSource: DwollaFundingSourceRequest = {
    routingNumber: "222222226",
    accountNumber: Date.now().toString(),
    bankAccountType: "savings",
    name: "Test Funding Source - Savings",
    channels: ["ACH"],
  };
  await createFundingSource(fundingSource, userId);
  await sleep(2000);
  await initiateMicroDepositsForTestUser(userId);
  await verifyMicroDepositsForTestUser(userId);
}

export function createDummyEvent(
  topic: string,
  id: string,
  userId: string,
  resource = "customers"
): DwollaEvent {
  const accountId = "0ee84069-47c5-455c-b425-633523291dc3";
  const eventId = v4();

  return {
    _links: {
      account: {
        href: `https://api-sandbox.dwolla.com/accounts/${accountId}`,
        "resource-type": "account",
        type: "application/vnd.dwolla.v1.hal+json",
      },
      customer: {
        href: `https://api-sandbox.dwolla.com/customers/${userId}`,
        "resource-type": "customer",
        type: "application/vnd.dwolla.v1.hal+json",
      },
      resource: {
        href: `https://api-sandbox.dwolla.com/${resource}/${id}`,
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

  // const { operators } = await getProvider();  // const { operators } = await getProvider();
  // for (let i = 0; i < operators.length; i++) {
  //   await Controller.methods
  //     .grantRole(OPERATOR_ROLE, operators[i])
  //     .send(sendOptions);
  //   log(
  //     `Added operator ${operators[i]} to list of OPERATOR_ROLE in the Controller contract`
  //   );
  // }
  // for (let i = 0; i < operators.length; i++) {
  //   await Controller.methods
  //     .grantRole(OPERATOR_ROLE, operators[i])
  //     .send(sendOptions);
  //   log(
  //     `Added operator ${operators[i]} to list of OPERATOR_ROLE in the Controller contract`
  //   );
  // }

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

  // Mint launch pool tokens
  const humanityCashAddress = await Controller.methods
    .humanityCashAddress()
    .call();
  await Token.methods
    .mint(humanityCashAddress, web3Utils.toWei("60000", "ether"))
    .send(sendOptions);

  // Renounce
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
