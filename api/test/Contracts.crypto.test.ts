/// <reference types="jest" />

import { v4 } from "uuid";
import * as contracts from "../src/service/contracts";
import { setupContracts } from "./utils";
import utils from "web3-utils";
import { getProvider } from "../src/utils/getProvider";
import { toBytes32 } from "../src/utils/crypto";
import { log } from "../src/utils";
import { describe, it, beforeAll, expect } from "@jest/globals";

describe("Test low-level smart contract functions", () => {
  const userId = v4();
  const userId2 = v4();
  const userId3 = v4();
  let operators: string[] = [];

  beforeAll(async () => {
    await setupContracts();
    operators = (await getProvider()).operators;

    log("Performing unit tests with new user " + userId);
    log("bytes32(userId) ", toBytes32(userId));

    const newWalletAddress = await contracts.newWallet(userId);
    log("Using new wallet at address", newWalletAddress);

    const testWalletAddress = await contracts.getWalletAddress(userId);
    log("Verified wallet address @ ", testWalletAddress);

    log("Performing unit tests with new user " + userId);

    const success = await contracts.deposit(userId, "10", operators[0]);
    log("Deposited $10 for userId ", userId, " result ", success.status);
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
      for (let i = 0; i < parseInt(count); i++) {
        const address = await contracts.getWalletAddressAtIndex(i);
        const wallet = await contracts.getWalletForAddress(address);
        users.push(wallet);
      }

      log(users);
      expect(users.length).toEqual(4);
    });

    it("Should create a new wallet", async () => {
      const wallet = await contracts.newWallet(v4());
      log(`wallet == ${wallet}`);
      expect(wallet).toBeDefined();
    });

    it("Should retrieve balance of a new wallet", async () => {
      const balance = await contracts.balanceOfWallet(userId);
      const bal = utils.fromWei(balance, "ether");
      log(`balance == ${bal}`);
      expect(parseFloat(bal)).toEqual(10.0);
    });

    it("Should deposit to a new wallet and verify the new balance", async () => {
      const wallet = await contracts.newWallet(userId2);
      log(`New wallet address == ${wallet} for userId ${userId2}`);
      expect(wallet).toBeDefined();

      const depositResult = await contracts.deposit(
        userId2,
        "99.99",
        operators[1]
      );
      log(`deposit transaction status == ${depositResult.status}`);

      const balance = await contracts.balanceOfWallet(userId2);
      const bal = utils.fromWei(balance, "ether");
      log(`balance == ${bal}`);
      expect(parseFloat(bal)).toEqual(99.99);
    });

    it("Should deposit to a new wallet, verify the balance, withdraw and verify the balance", async () => {
      const wallet = await contracts.newWallet(userId3);
      log(`New wallet address == ${wallet}`);
      expect(wallet).toBeDefined();

      const depositResult = await contracts.deposit(
        userId3,
        "99.99",
        operators[0]
      );
      log(`deposit transaction status == ${depositResult.status}`);

      let balance = await contracts.balanceOfWallet(userId3);
      let bal = utils.fromWei(balance, "ether");
      log(`balance == ${bal}`);
      expect(parseFloat(bal)).toEqual(99.99);

      const withdrawResult = await contracts.withdraw(
        userId3,
        "88.88",
        operators[0]
      );
      log(`withdraw transaction status == ${withdrawResult.status}`);

      balance = await contracts.balanceOfWallet(userId3);
      bal = utils.fromWei(balance, "ether");
      log(`balance == ${bal}`);
      expect(parseFloat(bal)).toEqual(11.11);
    });

    it("Should transfer between wallets", async () => {
      const result = await contracts.transferTo(userId3, userId, "1.11");
      expect(result).toBeDefined();
      log(JSON.stringify(result, null, 2));

      const balance = await contracts.balanceOfWallet(userId3);
      const bal = utils.fromWei(balance, "ether");
      log(`balance == ${bal}`);
      expect(parseFloat(bal)).toEqual(10.0);
    });

    it("Should get deposits for a user", async () => {
      const deposits = await contracts.getDepositsForUser(userId3);
      expect(deposits).toBeDefined();
      expect(deposits.length).toEqual(1);
      log(`deposits == ${JSON.stringify(deposits, null, 2)}`);
    });

    it("Should get withdrawals for a user", async () => {
      const withdrawals = await contracts.getWithdrawalsForUser(userId3);
      expect(withdrawals).toBeDefined();
      expect(withdrawals.length).toEqual(1);
      log(`withdrawals == ${JSON.stringify(withdrawals, null, 2)}`);
    });

    it("Should get transfers for a user", async () => {
      const transfers = await contracts.getTransfersForUser(userId3);
      expect(transfers).toBeDefined();
      expect(transfers.length).toEqual(1);
      log(`transfers == ${JSON.stringify(transfers, null, 2)}`);
    });
  });

  describe("Get deposits and withdrawals", () => {
    it("Should retrieve and iterate all deposit events", async () => {
      const response = await contracts.getDeposits();
      log(JSON.stringify(response, null, 2));
      expect(response).toBeDefined();
    });

    it("Should retrieve and iterate all withdrawal events", async () => {
      const response = await contracts.getWithdrawals();
      log(JSON.stringify(response, null, 2));
      expect(response).toBeDefined();
    });

    it("Should retrieve funding totals for each operator (bank)", async () => {
      const response = await contracts.getFundingStatus();
      log(JSON.stringify(response, null, 2));
      expect(response).toBeDefined();
    });
  });

  describe("Pause and unpause contract", () => {
    it("Should not unpause the controller while not paused", async () => {
      expect.assertions(1);
      await expect(contracts.unpause()).rejects.toBeDefined();
    });

    it("Should pause the controller", async () => {
      await contracts.pause();
      const paused = await contracts.paused();
      expect(paused).toEqual(true);
    });

    it("Should fail to pause the controller while already paused", async () => {
      expect.assertions(1);
      await expect(contracts.pause()).rejects.toBeDefined();
    });

    it("Should unpause the controller", async () => {
      await contracts.unpause();
      const paused = await contracts.paused();
      expect(paused).toEqual(false);
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

    it("Should fail transfer ownership twice", async () => {
      const { web3 } = await getProvider();
      const [, , , newOwner] = await web3.eth.getAccounts();
      expect.assertions(1);
      await expect(
        contracts.transferContractOwnership(newOwner)
      ).rejects.toBeDefined();
    });
  });
});
