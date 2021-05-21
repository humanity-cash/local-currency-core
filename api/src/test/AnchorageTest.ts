import assert from "assert";
import dotenv from "dotenv";
import * as anchorage from "../service/custodian/Anchorage";
import {
  quoteRequest, acceptQuote,
} from "../service/custodian/AnchorageTypes";

const result = dotenv.config();
if (result.error) {
  throw result.error;
}

function log(msg: string): void {
  if (process.env.DEBUG === "true") console.log(msg);
}

describe("Basic API connectivity", () => {
  it("Should create an API request header", async () => {
    const quoteRequest: quoteRequest = {
      tradingPair: "CUSD_USD",
      side: "SELL",
      quantity: 1000,
      currency: "CUSD",
    };
    const header = anchorage.createHeadersForRequest(
      "POST",
      "/test/",
      quoteRequest
    );
    log(header);
    assert(header);
  });

  it("Should get vaults", async () => {
    try {
      const res = await anchorage.getVaults();
      console.log(res);
      assert(res.data?.length > 0);
    } catch (e) {
      assert(false);
    }
  });

  xit("Should request a 1 cUSD quote", async () => {
    try {
      const quote = await anchorage.getQuote(1);
      assert(quote);
    } catch (e) {
      assert(false);
    }
  });

  xit("Should accept a 1 cUSD quote", async () => {
    try {
      const quote = await anchorage.getQuote(1);
      assert(quote);
      const accept: acceptQuote = {
        quoteID: quote.data.quoteID,
        side: "SELL",
      };
      const accepted = await anchorage.acceptQuote(accept);
      assert(accepted);
    } catch (e) {
      assert(false);
    }
  });

  xit("Should sell 1 cUSD", async () => {
    try {
      const accepted = await anchorage.sell(1);
      assert(accepted);
    } catch (e) {
      assert(false);
    }
  });
});
