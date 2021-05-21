import assert from "assert";
import dotenv from "dotenv";
import * as celoUBI from "../service/celoubi/CeloUbi";
import Web3 from "web3";
import { v4 } from "uuid";
import { toBytes32 } from "../utils/utils";

const result = dotenv.config();
if (result.error) {
  throw result.error;
}
function log(msg: string): void {
  if (process.env.DEBUG === "true") console.log(msg);
}

describe("Check basic connectivity to a smart contract", () => {
  const userIdRaw = v4();
  const transactionId = v4();
  log("Performing unit tests with new user " + userIdRaw);
  log("Performing unit tests with transactionId " + transactionId);
  const userId = toBytes32(userIdRaw);

  describe("Call public functions", () => {
    it("Should return value of disbursementWei", async () => {
      const disbursementWei = await celoUBI.disbursementWei();
      log(`disbursementWei == ${disbursementWei}`);
      assert(disbursementWei > 0);
    });

    it("Should return value of cUSDToken", async () => {
      const cUSDToken = await celoUBI.cUSDToken();
      log(`cUSDToken == ${cUSDToken}`);
      assert(cUSDToken != "");
    });

    it("Should return value of cUBIAuthToken", async () => {
      const cUBIAuthToken = await celoUBI.cUBIAuthToken();
      log(`cUBIAuthToken == ${cUBIAuthToken}`);
      assert(cUBIAuthToken != "");
    });

    it("Should return value of reconciliationAccount", async () => {
      const reconciliationAccount = await celoUBI.reconciliationAccount();
      log(`reconciliationAccount == ${reconciliationAccount}`);
      assert(reconciliationAccount != "");
    });

    it("Should return value of owner", async () => {
      const owner = await celoUBI.owner();
      log(`owner == ${owner}`);
      assert(owner != "");
    });
  });

  describe.skip("Call owner functions", () => {
    it("Should update disbursementWei", async () => {
      const disbursementWei = 150000000000;
      await celoUBI.setDisbursementWei(disbursementWei);
      const result = await celoUBI.disbursementWei();
      log(`disbursementWei == ${result}`);
      assert(result == disbursementWei);
    });
  });

  describe.skip("Call user functions", () => {
    it("Should create a new UBI beneficiary", async () => {
      const newUbiBeneficiary = await celoUBI.newUbiBeneficiary(userIdRaw);
      log(`newUbiBeneficiary == ${newUbiBeneficiary}`);
      assert(newUbiBeneficiary);
    });

    it("Should retrieve balance of new UBI beneficiary", async () => {
      const balance = await celoUBI.balanceOfUBIBeneficiary(userId);
      log(`balance == ${balance}`);
      assert(parseInt(balance) > 0);
    });

    it("Should create a few new UBI beneficiary and iterate them", async () => {
      await celoUBI.newUbiBeneficiary(v4());
      await celoUBI.newUbiBeneficiary(v4());
      await celoUBI.newUbiBeneficiary(v4());

      const count = await celoUBI.getBeneficiaryCount();
      assert(count);
      log("Number of users is " + count);

      const users = [];
      for (let i = 0; i < count; i++) {
        const address = await celoUBI.getBeneficiaryAddressAtIndex(i);
        const ubi = await celoUBI.getUBIBeneficiaryForAddress(address);
        users.push(ubi);
      }

      console.log(users);
      assert(users);
      assert(users.length >= 3);
    });
  });

  describe.skip("Call authorization and settlement functions", () => {
    const amt = 22;
    const amtInWei = Web3.utils.toWei(`${amt}`, "ether");

    it("Should authorize a payment", async () => {
      const result = await celoUBI.authorize(userId, transactionId, amt);
      log(`result == ${JSON.stringify(result)}`);
      assert(result);
    });

    it("Should verify authorization balance", async () => {
      const balance = await celoUBI.authBalanceOfUBIBeneficiary(userId);
      log(`balance == ${JSON.stringify(balance)}`);
      assert.strictEqual(balance, amtInWei);
    });

    it("Should deauthorize a payment", async () => {
      const result = await celoUBI.deauthorize(userId, transactionId);
      log(`balance == ${JSON.stringify(result)}`);
      assert(result);
    });

    it("Should verify authorization balance", async () => {
      const zero = Web3.utils.toWei("0", "ether");
      const balance = await celoUBI.authBalanceOfUBIBeneficiary(userId);
      log(`balance == ${JSON.stringify(balance)}`);
      assert.strictEqual(balance, zero);
    });

    it("Should settle a payment", async () => {
      const result = await celoUBI.settle(userId, transactionId, amt);
      log(`result == ${JSON.stringify(result)}`);
      assert(result);
    });

    it("Should verify total balance", async () => {
      const seventyeight = Web3.utils.toWei("78", "ether");
      const balance = await celoUBI.balanceOfUBIBeneficiary(userId);
      log(`balance == ${JSON.stringify(balance)}`);
      assert.strictEqual(balance, seventyeight);
    });

    it("Should iterate authorizations for a user", async () => {
      const address = await celoUBI.beneficiaryAddress(userId);
      const authorizations = await celoUBI.getAuthorizationsForAddress(address);
      assert(authorizations);
    });

    it("Should iterate settlements for a user", async () => {
      const address = await celoUBI.beneficiaryAddress(userId);
      const settlements = await celoUBI.getSettlementsForAddress(address);
      assert(settlements);
    });
  });
});
