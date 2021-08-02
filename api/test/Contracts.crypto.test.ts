/// <reference types="jest" />

import dotenv from "dotenv";
import path from "path";
import { v4 } from "uuid";
import * as contracts from "../src/service/contracts";
import { log, setupContracts } from "./utils";
import utils from "web3-utils";
import { getProvider } from "../src/utils/getProvider";
import { toBytes32 } from "../src/utils/crypto";

const result = dotenv.config({
  path: path.resolve(process.cwd(), ".env.test"),
});

if (result.error) {
  throw result.error;
}

describe("Check basic connectivity to a smart contract", () => {
  
  const userId = v4();

  beforeAll(async () => {
    
    await setupContracts();
    
    log("Performing unit tests with new user " + userId);
    log("bytes32(userId) ", toBytes32(userId));

    const newWalletAddress = await contracts.newWallet(userId);
    log("Using new wallet at address", newWalletAddress);

    const testWalletAddress = await contracts.getWalletAddress(userId);
    log("Verified wallet address @ ", testWalletAddress);

    log("Performing unit tests with new user " + userId);

    const success = await contracts.deposit(userId, "10");
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
      const balance = await contracts.balanceOfWallet(userId);
      const bal = utils.fromWei(balance, "ether");
      log(`balance == ${bal}`);
      expect(parseFloat(bal)).toEqual(10.0);
    });

    it("Should deposit to a new wallet and verify the new balance", async () => {

      const newUserId = v4();
      const wallet = await contracts.newWallet(newUserId);
      log(`New wallet address == ${wallet} for userId ${newUserId}`);
      expect(wallet).toBeDefined();

      const depositResult = await contracts.deposit(newUserId, "99.99");
      log(`deposit transaction status == ${depositResult.status}`);

      const balance = await contracts.balanceOfWallet(newUserId);
      const bal = utils.fromWei(balance, "ether");
      log(`balance == ${bal}`);
      expect(parseFloat(bal)).toEqual(99.99);

    });

    it("Should deposit to a new wallet, verify the balance, withdraw and verify the balance", async () => {

      const newUserId = v4();
      const wallet = await contracts.newWallet(newUserId);
      log(`New wallet address == ${wallet}`);
      expect(wallet).toBeDefined();

      const depositResult = await contracts.deposit(newUserId, "99.99");
      log(`deposit transaction status == ${depositResult.status}`);

      let balance = await contracts.balanceOfWallet(newUserId);
      let bal = utils.fromWei(balance, "ether");
      log(`balance == ${bal}`);
      expect(parseFloat(bal)).toEqual(99.99);

      const withdrawResult = await contracts.withdraw(newUserId, "88.88");
      log(`withdraw transaction status == ${withdrawResult.status}`);

      balance = await contracts.balanceOfWallet(newUserId);
      bal = utils.fromWei(balance, "ether");
      log(`balance == ${bal}`);
      expect(parseFloat(bal)).toEqual(11.11);
      
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
      await expect(contracts.transferContractOwnership(newOwner)).rejects.toBeDefined();
    });
  });
});