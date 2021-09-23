import chai from "chai";
import chaiHttp from "chai-http";
import dotenv from "dotenv";
import path from "path";
import * as sinon from "sinon";
import * as aws from "../aws";
import { getApp } from "../server";
import { log } from "../utils";
import { codes } from "../utils/http";

const expect = chai.expect;
chai.use(chaiHttp);
const server = getApp();

const result = dotenv.config({
  path: path.resolve(process.cwd(), ".env.test"),
});

if (result.error) {
  throw result.error;
}

let stub;
describe("Middlewares", () => {
  afterEach(() => {
    sinon.restore();
  });

  describe("auth", () => {
    it("Incorrect token", (done) => {
      stub = sinon.stub(aws, "verifyCognitoToken");
      chai
        .request(server)
        .get("/health")
        .set("authorization", "tokeeeen")
        .then((res) => {
          expect(res).to.have.status(codes.UNAUTHORIZED);
          expect(JSON.parse(res.text)).to.eql({
            message: "User is Unauthorized",
          });
          expect(stub.calledOnce).to.eql(true);
          log(JSON.parse(res.text));
          done();
        })
        .catch((err) => {
          throw err;
        });
    });
  });

  it("Token does not exist", (done) => {
    stub = sinon.stub(aws, "verifyCognitoToken");
    chai
      .request(server)
      .get("/health")
      .then((res) => {
        expect(res).to.have.status(codes.UNAUTHORIZED);
        expect(JSON.parse(res.text)).to.eql({
          message: "No Auth Headers In Request",
        });
        expect(stub.calledOnce).to.eql(false);
        log(JSON.parse(res.text));
        done();
      })
      .catch((err) => {
        throw err;
      });
  });
});
