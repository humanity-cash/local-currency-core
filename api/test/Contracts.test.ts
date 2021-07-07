// @ts-ignore
import dotenv from "dotenv";
// @ts-ignore
import path from "path";
import { v4 } from "uuid";
import * as contracts from "../src/service/contracts";
import { log, setupContracts } from "./utils";
import { toBytes32 } from "../src/utils/crypto";
// @ts-ignore
import utils from "web3-utils";
import { getProvider } from "../src/utils/getProvider";

const result = dotenv.config({
  path: path.resolve(process.cwd(), ".env.test"),
});

if (result.error) {
  throw result.error;
}

describe("Check basic connectivity to a smart contract", () => {
  const userId = v4();
  log("Performing unit tests with new user " + userId);

  beforeAll(async () => {
    await setupContracts();

    await contracts.newWallet(userId);
    await contracts.deposit(userId, "10.0");
  });

  describe("Call public functions", () => {
    it("Should return value of cUSDToken", async () => {
      const token = await contracts.token();
      log(`cUSDToken == ${token}`);
      expect(token).toBeDefined();
    });

    it("Should return value of owner", async () => {
      const owner = await contracts.owner();
      log(`owner == ${owner}`);
      expect(owner).toBeDefined();
    });
  });

  describe("Call user functions", () => {
    it("Should create a few new wallets and iterate them", async () => {
      await contracts.newWallet(v4());
      await contracts.newWallet(v4());
      await contracts.newWallet(v4());

      const count = await contracts.getWalletCount();
      expect(count).toBeDefined();
      log("Number of users is " + count);

      const users = [];
      for (let i = 0; i < count; i++) {
        const address = await contracts.getWalletAddressAtIndex(i);
        const wallet = await contracts.getWalletForAddress(address);
        users.push(wallet);
      }

      console.log(users);
      expect(users.length).toEqual(4);
    });

    it("Should create a new wallet", async () => {
      const wallet = await contracts.newWallet(v4());
      log(`wallet == ${wallet}`);
      expect(wallet).toBeDefined();
    });

    it("Should retrieve balance of a new wallet", async () => {
      const balance = await contracts.balanceOfWallet(toBytes32(userId));
      const bal = utils.fromWei(balance, "ether");
      log(`balance == ${bal}`);
      expect(parseFloat(bal)).toEqual(10.0);
    });
  });

  describe("Transfer ownership", () => {
    it("Should transfer ownership of the controller", async () => {
      const { web3 } = await getProvider();
      const [, , , newOwner] = await web3.eth.getAccounts();
      await contracts.transferContractOwnership(newOwner);
      const newOwnerCheck = await contracts.owner();
      expect(newOwnerCheck).toEqual(newOwner);
    });
  });
});
