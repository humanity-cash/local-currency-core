import dotenv from "dotenv";
import chai from "chai";
import path from "path";
import chaiHttp from "chai-http";
import { getApp } from "../src/server";
import { log, setupContracts } from "./utils";
import * as sinon from 'sinon';
import * as aws from '../src/aws';
import { codes } from "../src/utils/http";

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
		 	const stub = sinon.stub(aws, 'verifyCognitoToken').returns({success: true})
      chai
        .request(server)
        .get("/health")
				.set('authorization', 'tokeeeen')
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          log(JSON.parse(res.text));
					expect(stub.calledOnce).to.eql(true);
          done();
        })
        .catch((err) => {
          throw err;
        });
    });
  });
});
