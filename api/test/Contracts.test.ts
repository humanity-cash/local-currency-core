// @ts-ignore
import dotenv from "dotenv";
// @ts-ignore
import path from "path";
import { v4 } from "uuid";
import * as contracts from "../src/service/contracts";
import { log, setupContracts } from "./utils";

const result = dotenv.config({
  path: path.resolve(process.cwd(), ".env.test"),
});

if (result.error) {
  throw result.error;
}

describe("Check basic connectivity to a smart contract", () => {
  const userId = v4();
  log("Performing unit tests with new user " + userId);

  const transactionId = v4();
  log("Performing unit tests with transactionId " + transactionId);

  beforeEach(async () => {
    await setupContracts();
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
    it.skip("Should create a new wallet", async () => {
      const wallet = await contracts.newWallet(userId);
      log(`wallet == ${wallet}`);
      expect(wallet).toBeDefined();
    });

    it.skip("Should retrieve balance of a new wallet", async () => {
      const balance = await contracts.balanceOfWallet(userId);
      log(`balance == ${balance}`);
      expect(parseInt(balance)).toBeGreaterThan(0);
    });

    it.skip("Should create a few new wallets and iterate them", async () => {
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
      expect(users.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("Transfer ownership", () => {
    it("Should transfer ownership of the controller", async () => {
      const addr = await contracts.token();
      await contracts.transferContractOwnership(addr);
      const newOwner = await contracts.owner();
      expect(newOwner).toEqual(addr);
    });
  });
});
