import chai from "chai";
import chaiHttp from "chai-http";
import { getApp } from "../server";
import { setupContracts } from "./utils";
import { log } from "../utils";
import { codes } from "../utils/http";
import { describe, it, beforeAll } from "@jest/globals";

const expect = chai.expect;
chai.use(chaiHttp);
const server = getApp();

describe("Public endpoints test", () => {
  beforeAll(async () => {
    await setupContracts();
  });

  describe("GET /health", () => {
    it("it should retrieve heath data", (done) => {
      chai
        .request(server)
        .get("/health")
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          log(JSON.parse(res.text));
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });
});
