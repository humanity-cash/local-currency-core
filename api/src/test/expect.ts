import chai from "chai";
import { log } from "../utils";

const expect = chai.expect;

export function expectIWallet(wallet: unknown): void {
  log(wallet);
  expect(wallet).to.have.property("userId");
  expect(wallet).to.have.property("address");
  expect(wallet).to.have.property("createdBlock");
  expect(wallet).to.have.property("createdTimestamp");
  expect(wallet).to.have.property("availableBalance");
}

export function expectFundingSource(fundingSource: unknown): void {
  log(fundingSource);
  expect(fundingSource).to.have.property("status");
  expect(fundingSource).to.have.property("headers");
  expect(fundingSource).to.have.property("body");
}

export function expectIDeposit(deposit: unknown): void {
  log(deposit);
  expect(deposit).to.have.property("transactionHash");
  expect(deposit).to.have.property("blockNumber");
  expect(deposit).to.have.property("timestamp");
  expect(deposit).to.have.property("operator");
  expect(deposit).to.have.property("userId");
  expect(deposit).to.have.property("value");
  expect(deposit).to.have.property("fromName");
  expect(deposit).to.have.property("toName");
}

export function expectIWithdrawal(withdrawal: unknown): void {
  log(withdrawal);
  expect(withdrawal).to.have.property("transactionHash");
  expect(withdrawal).to.have.property("blockNumber");
  expect(withdrawal).to.have.property("timestamp");
  expect(withdrawal).to.have.property("operator");
  expect(withdrawal).to.have.property("userId");
  expect(withdrawal).to.have.property("value");
  expect(withdrawal).to.have.property("fromName");
  expect(withdrawal).to.have.property("toName");
}

export function expectITransferEvent(transfer: unknown): void {
  log(transfer);
  expect(transfer).to.have.property("transactionHash");
  expect(transfer).to.have.property("blockNumber");
  expect(transfer).to.have.property("timestamp");
  expect(transfer).to.have.property("fromUserId");
  expect(transfer).to.have.property("fromAddress");
  expect(transfer).to.have.property("toUserId");
  expect(transfer).to.have.property("toAddress");
  expect(transfer).to.have.property("value");
  expect(transfer).to.have.property("type");
  expect(transfer).to.have.property("fromName");
  expect(transfer).to.have.property("toName");
  expect(transfer).to.have.property("fromDwollaUserId");
  expect(transfer).to.have.property("toDwollaUserId");
}

export function expectBusiness(business: unknown): void {
  log(business);
  expect(business).to.have.property("story");
  expect(business).to.have.property("tag");
  expect(business).to.have.property("avatar");
  expect(business).to.have.property("type");
  expect(business).to.have.property("rbn");
  expect(business).to.have.property("industry");
  expect(business).to.have.property("ein");
  expect(business).to.have.property("address1");
  expect(business).to.have.property("address2");
  expect(business).to.have.property("city");
  expect(business).to.have.property("state");
  expect(business).to.have.property("postalCode");
  expect(business).to.have.property("phoneNumber");
  expect(business).to.have.property("owner");
}
