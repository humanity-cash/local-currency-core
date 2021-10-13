import { beforeAll, describe, it } from "@jest/globals";
import chai from "chai";
import chaiHttp from "chai-http";
import * as sinon from "sinon";
import * as aws from "../aws";
import { getApp } from "../server";
import { log } from "../utils";
import { codes } from "../utils/http";
import { setupContracts } from "./utils";
import { mockDatabase } from "./setup/setup-db-integration";

const expect = chai.expect;
chai.use(chaiHttp);
const server = getApp();

describe("Public endpoints test", () => {
  
  beforeAll(async () => {
    await mockDatabase.init();
    await setupContracts();
  });
  
  afterAll(async (): Promise<void> => {
    await mockDatabase.stop();
  });

  describe("GET /health", () => {

    beforeEach(async (): Promise<void> => {
      if (mockDatabase.isConnectionOpen()) return;
      await mockDatabase.openNewMongooseConnection();
    });

    it("it should retrieve heath data", (done) => {
      const stub = sinon
        .stub(aws, "verifyCognitoToken")
        .returns({ success: true });
      chai
        .request(server)
        .get("/health")
        .set("authorization", "tokeeeen")
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          log(JSON.parse(res.text));
          expect(res.body).to.haveOwnProperty("blockNumber");
          expect(res.body).to.haveOwnProperty("chainId");
          expect(res.body).to.haveOwnProperty("nodeInfo");
          expect(res.body).to.haveOwnProperty("token");
          expect(res.body).to.haveOwnProperty("walletCount");
          expect(res.body).to.haveOwnProperty("owner");
          expect(res.body).to.haveOwnProperty("walletFactory");
          expect(stub.calledOnce).to.eql(true);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });
});
