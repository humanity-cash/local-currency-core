import dotenv from "dotenv";
import chai from "chai";
import path from "path";
import chaiHttp from "chai-http";
import { getApp } from "../src/server";
import { setupContracts } from "./utils";
import { log } from "../src/utils";
import { codes } from "../src/utils/http";
import { describe, it, beforeAll } from "@jest/globals";

const expect = chai.expect;
chai.use(chaiHttp);
const server = getApp();

const result = dotenv.config({
  path: path.resolve(process.cwd(), ".env.test"),
});
if (result.error) {
  throw result.error;
}

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
