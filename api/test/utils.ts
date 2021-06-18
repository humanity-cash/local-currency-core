import { Contract } from "web3-eth-contract";
import Web3 from "web3";

let sendConfig;
let web3;

export function log(msg: string): void {
  if (process.env.DEBUG === "true") console.log(msg);
}

export async function setupContracts(): Promise<void> {
  web3 = new Web3(process.env.CELO_UBI_RPC_HOST);

  sendConfig = {
    from: (await web3.eth.getAccounts())[0],
    gas: 6721975,
    gasPrice: "10000",
  };

  const cUSD = await deployContract("ERC20", ["cUSD", "cUSD"]);

  const authToken = await deployContract("ERC20PresetMinterPauser", [
    "cUSD",
    "cUSD",
  ]);

  const Wallet = await deployContract("Wallet");

  const UBIReconciliationAccount = await deployContract(
    "UBIReconciliationAccount",
    /*
        initialize
        address _cUSDToken,
        address _cUBIAuthToken,
        address _custodian,
        address _controller
     */
    []
  );

  const WalletFactory = await deployContract(
    "WalletFactory",
    /*
      constructor
      IUBIBeneficiary _ubiLogic,
      IUBIReconciliationAccount _reconciliationLogic,
      IERC20 _cUSDToken,
      ERC20PresetMinterPauser _cUBIAuthToken
     */
    [
      Wallet.options.address,
      UBIReconciliationAccount.options.address,
      cUSD.options.address,
      authToken.options.address,
    ]
  );

  const Controller = await deployContract(
    "Controller",
    /*
      constructor
      address _cUSDToken,
      address _cUBIAuthToken,
      address _factory,
      address _custodian
     */
    [
      cUSD.options.address,
      authToken.options.address,
      WalletFactory.options.address,
      (await web3.eth.getAccounts())[1],
    ]
  );

  const args = [
    cUSD.options.address,
    authToken.options.address,
    (await web3.eth.getAccounts())[1],
    Controller.options.address,
  ];

  await UBIReconciliationAccount.methods.initialize(...args).send(sendConfig);
  // console.log("Initialize called on UBIReconciliationAccount", "with", args);

  process.env.CELO_UBI_ADDRESS = Controller.options.address;
}

async function deployContract(
  name: string,
  args: any[] = [],
  tokens: { [name: string]: string } = {}
): Promise<Contract> {
  let contractInstance;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const abi = require(`../src/service/celoubi/artifacts/${name}.abi.json`);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const bytecode = require(`../src/service/celoubi/artifacts/${name}.bin.json`);

    const tempContract = new web3.eth.Contract(abi);
    const isZos = !!tempContract.methods.initialize;

    contractInstance = await tempContract
      .deploy({
        data: replaceTokens(bytecode.toString(), tokens),
        arguments: isZos ? undefined : args,
      })
      .send(sendConfig);

    // console.log("Deployed", name, "at", contractInstance.options.address, isZos);
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
