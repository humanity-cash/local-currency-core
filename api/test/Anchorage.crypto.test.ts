import dotenv from "dotenv";
import * as anchorage from "../src/service/custodian/Anchorage";
import { quoteRequest } from "../src/service/custodian/AnchorageTypes";
import path from "path";

const result = dotenv.config({
  path: path.resolve(process.cwd(), ".env.test"),
});

if (result.error) {
  throw result.error;
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
    expect(header).toBeDefined();
  });

  // xit("Should get vaults", async () => {
  //   try {
  //     const res = await anchorage.getVaults();
  //     console.log(res);
  //     assert(res.data?.length > 0);
  //   } catch (e) {
  //     assert(false);
  //   }
  // });

  // xit("Should request a 1 cUSD quote", async () => {
  //   try {
  //     const quote = await anchorage.getQuote(1);
  //     assert(quote);
  //   } catch (e) {
  //     assert(false);
  //   }
  // });

  // xit("Should accept a 1 cUSD quote", async () => {
  //   try {
  //     const quote = await anchorage.getQuote(1);
  //     assert(quote);
  //     const accept: acceptQuote = {
  //       quoteID: quote.data.quoteID,
  //       side: "SELL",
  //     };
  //     const accepted = await anchorage.acceptQuote(accept);
  //     assert(accepted);
  //   } catch (e) {
  //     assert(false);
  //   }
  // });

  // xit("Should sell 1 cUSD", async () => {
  //   try {
  //     const accepted = await anchorage.sell(1);
  //     assert(accepted);
  //   } catch (e) {
  //     assert(false);
  //   }
  // });
});
