import { describe, it } from "@jest/globals";
import { getClientToken } from "../service/digital-banking/DwollaUtils";
import { log, sleep } from "../utils";
import chai from "chai";
const expect = chai.expect;

describe.skip("Dwolla client token test suite", () => {
  describe("Dwolla: getClientToken", () => {
    afterAll(async () => {
      await sleep(1000);
    });

    it("Should request and receive a valid Dwolla client token", (done) => {
      try {
        getClientToken().then((clientToken) => {
          log(clientToken);
          expect(clientToken).to.exist;
          done();
        });
      } catch (err) {
        done(err);
      }
    });
  });
});
