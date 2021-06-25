// @ts-ignore
import dotenv from "dotenv";
// @ts-ignore
import path from "path";
import { v4 } from "uuid";
import * as contracts from "../src/service/contracts";
import { toBytes32 } from "../src/utils/crypto";
import { log, setupContracts } from "./utils";

const result = dotenv.config({
  path: path.resolve(process.cwd(), ".env.test"),
});

if (result.error) {
  throw result.error;
}

describe("Check basic connectivity to a smart contract", () => {
  const userIdRaw = v4();
  log("Performing unit tests with new user " + userIdRaw);

  const transactionId = v4();
  log("Performing unit tests with transactionId " + transactionId);

  const userId = toBytes32(userIdRaw);

  beforeAll(async () => {
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

  describe.skip("Call user functions", () => {
    beforeAll(async () => {
      await contracts.newWallet(userIdRaw);
    });

    it("Should create a new wallet", async () => {
      const newUbiBeneficiary = await contracts.newWallet(userIdRaw);
      log(`newUbiBeneficiary == ${newUbiBeneficiary}`);
      expect(newUbiBeneficiary).toBeDefined();
    });

    it("Should retrieve balance of new UBI beneficiary", async () => {
      const balance = await contracts.balanceOfWallet(userId);
      log(`balance == ${balance}`);
      expect(parseInt(balance)).toBeGreaterThan(0);
    });

    it("Should create a few new UBI beneficiary and iterate them", async () => {
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
});
