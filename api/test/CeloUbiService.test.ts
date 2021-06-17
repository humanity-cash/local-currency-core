import dotenv from "dotenv";
import path from "path";
import { v4 } from "uuid";
import Web3 from "web3";
import * as celoUBI from "../src/service/celoubi";
import { toBytes32 } from "../src/utils/crypto";
import { log } from "./utils";

const result = dotenv.config({
  path: path.resolve(process.cwd(), ".env.test"),
});

if (result.error) {
  throw result.error;
}

describe.skip("Check basic connectivity to a smart contract", () => {
  const userIdRaw = v4();
  const transactionId = v4();
  log("Performing unit tests with new user " + userIdRaw);
  log("Performing unit tests with transactionId " + transactionId);
  const userId = toBytes32(userIdRaw);

  describe("Call public functions", () => {
    it.skip("Should return value of disbursementWei", async () => {
      const disbursementWei = await celoUBI.disbursementWei();
      log(`disbursementWei == ${disbursementWei}`);
      expect(Number(disbursementWei)).toBeGreaterThan(0);
    });

    it("Should return value of cUSDToken", async () => {
      const cUSDToken = await celoUBI.cUSDToken();
      log(`cUSDToken == ${cUSDToken}`);
      expect(cUSDToken).toBeDefined();
    });

    it("Should return value of cUBIAuthToken", async () => {
      const cUBIAuthToken = await celoUBI.cUBIAuthToken();
      log(`cUBIAuthToken == ${cUBIAuthToken}`);
      expect(cUBIAuthToken).toBeDefined();
    });

    it("Should return value of reconciliationAccount", async () => {
      const reconciliationAccount = await celoUBI.reconciliationAccount();
      log(`reconciliationAccount == ${reconciliationAccount}`);
      expect(reconciliationAccount).toBeDefined();
    });

    it("Should return value of owner", async () => {
      const owner = await celoUBI.owner();
      log(`owner == ${owner}`);
      expect(owner).toBeDefined();
    });
  });

  describe("Call owner functions", () => {
    it("Should update disbursementWei", async () => {
      const disbursementWei = 150000000000;
      await celoUBI.setDisbursementWei(disbursementWei);
      const result = await celoUBI.disbursementWei();
      log(`disbursementWei == ${result}`);
      expect(result).toEqual(disbursementWei);
    });
  });

  describe("Call user functions", () => {
    it("Should create a new UBI beneficiary", async () => {
      const newUbiBeneficiary = await celoUBI.newUbiBeneficiary(userIdRaw);
      log(`newUbiBeneficiary == ${newUbiBeneficiary}`);
      expect(newUbiBeneficiary).toBeDefined();
    });

    it("Should retrieve balance of new UBI beneficiary", async () => {
      const balance = await celoUBI.balanceOfUBIBeneficiary(userId);
      log(`balance == ${balance}`);
      expect(parseInt(balance)).toBeGreaterThan(0);
    });

    it("Should create a few new UBI beneficiary and iterate them", async () => {
      await celoUBI.newUbiBeneficiary(v4());
      await celoUBI.newUbiBeneficiary(v4());
      await celoUBI.newUbiBeneficiary(v4());

      const count = await celoUBI.getBeneficiaryCount();
      expect(count).toBeDefined();
      log("Number of users is " + count);

      const users = [];
      for (let i = 0; i < count; i++) {
        const address = await celoUBI.getBeneficiaryAddressAtIndex(i);
        const ubi = await celoUBI.getUBIBeneficiaryForAddress(address);
        users.push(ubi);
      }

      console.log(users);
      expect(users.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("Call authorization and settlement functions", () => {
    const amt = 22;
    const amtInWei = Web3.utils.toWei(`${amt}`, "ether");

    it("Should authorize a payment", async () => {
      const result = await celoUBI.authorize(userId, transactionId, amt);
      log(`result == ${JSON.stringify(result)}`);
      expect(result).toBeDefined();
    });

    it("Should verify authorization balance", async () => {
      const balance = await celoUBI.authBalanceOfUBIBeneficiary(userId);
      log(`balance == ${JSON.stringify(balance)}`);
      expect(balance).toEqual(amtInWei);
    });

    it("Should deauthorize a payment", async () => {
      const result = await celoUBI.deauthorize(userId, transactionId);
      log(`balance == ${JSON.stringify(result)}`);
      expect(result).toBeDefined();
    });

    it("Should verify authorization balance", async () => {
      const zero = Web3.utils.toWei("0", "ether");
      const balance = await celoUBI.authBalanceOfUBIBeneficiary(userId);
      log(`balance == ${JSON.stringify(balance)}`);
      expect(balance).toEqual(zero);
    });

    it("Should settle a payment", async () => {
      const result = await celoUBI.settle(userId, transactionId, amt);
      log(`result == ${JSON.stringify(result)}`);
      expect(result).toBeDefined();
    });

    it("Should verify total balance", async () => {
      const seventyeight = Web3.utils.toWei("78", "ether");
      const balance = await celoUBI.balanceOfUBIBeneficiary(userId);
      log(`balance == ${JSON.stringify(balance)}`);
      expect(balance).toEqual(seventyeight);
    });

    it("Should iterate authorizations for a user", async () => {
      const address = await celoUBI.beneficiaryAddress(userId);
      const authorizations = await celoUBI.getAuthorizationsForAddress(address);
      expect(authorizations).toBeDefined();
    });

    it("Should iterate settlements for a user", async () => {
      const address = await celoUBI.beneficiaryAddress(userId);
      const settlements = await celoUBI.getSettlementsForAddress(address);
      expect(settlements).toBeDefined();
    });
  });
});
