import { Contract } from "web3-eth-contract";
import Web3 from "web3";

const web3 = new Web3(process.env.CELO_UBI_RPC_HOST);

export function log(msg: string): void {
  if (process.env.DEBUG === "true") console.log(msg);
}

export async function setupContracts(): Promise<void> {

  const demurrage = await deployContract(
    "Demurrage"
  );

  await deployContract(
    "UBIBeneficiary",
    [],
    {
      Demurrage: demurrage.options.address
    }
  );
}

async function deployContract(
  name: string,
  args: any[] = [],
  tokens: { [name: string]: string } = {}
): Promise<Contract> {


  let contractInstance;
  try {
    const sendConfig = {
      from: (await web3.eth.getAccounts())[0],
      gas: 6721975,
      gasPrice: "10000"
    };

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const abi = require(`../service/celoubi/abi/${name}.json`);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const bytecode = require(`../service/celoubi/abi/${name}.bin.json`);

    const tempContract = new web3.eth.Contract(abi);

    contractInstance = await tempContract
      .deploy({
        data: replaceTokens(
          bytecode.toString(),
          tokens
        ),
        arguments: args
      })
      .send(sendConfig);

    console.log("Deployed", name, "at", contractInstance.options.address);
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
