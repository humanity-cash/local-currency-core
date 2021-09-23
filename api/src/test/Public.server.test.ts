import { beforeAll, describe, it } from "@jest/globals";
import chai from "chai";
import chaiHttp from "chai-http";
import * as sinon from 'sinon';
import * as aws from '../aws';
import { getApp } from "../server";
import { log } from "../utils";
import { codes } from "../utils/http";
import { setupContracts } from "./utils";

const expect = chai.expect;
chai.use(chaiHttp);
const server = getApp();

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
          done(err);
        });
    });
  });
});
