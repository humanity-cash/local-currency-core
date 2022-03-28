import { describe, it } from "@jest/globals";
import chai from "chai";
import { v4 } from "uuid";
import {
  DepositEmailTemplate,
  WithdrawalEmailTemplate,
  sendTemplatedEmail,
} from "../aws";

const expect = chai.expect;

describe("Email testing", () => {
  it("should send a DepositCompleted template email", async () => {
    const params: DepositEmailTemplate = {
      amount: "1.23",
      userId: v4(),
      transactionId: v4(),
      timestamp: new Date().toLocaleString(),
      randomness: v4(), //required so Gmail doesn't bundle the emails and trim the footer
    };
    const success = await sendTemplatedEmail(
      "DepositCompleted",
      params,
      "aaron@humanity.cash"
    );
    expect(success);
  });

  it("should send a WithdrawalCompleted template email", async () => {
    const params: WithdrawalEmailTemplate = {
      amount: "94.56",
      userId: v4(),
      transactionId: v4(),
      timestamp: new Date().toLocaleString(),
      feeAmount: "0.50",
      netAmount: "94.06",
      randomness: v4(), //required so Gmail doesn't bundle the emails and trim the footer
    };
    const success: boolean = await sendTemplatedEmail(
      "WithdrawalCompleted",
      params,
      "aaron@humanity.cash"
    );
    expect(success);
  });
});
