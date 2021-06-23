import * as Kit from "@celo/contractkit";
import { generateKeys } from "@celo/utils/lib/account";
import { privateKeyToAddress } from "@celo/utils/lib/address";
import { ContractKit } from "@celo/contractkit/lib/kit";

let kit: ContractKit;

export const getKit = async (): Promise<Kit.ContractKit> => {
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
