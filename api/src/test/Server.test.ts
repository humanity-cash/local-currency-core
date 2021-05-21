import chai from "chai";
import chaiHttp from "chai-http";
import { getApp } from "../server";
import dotenv from "dotenv";

const expect = chai.expect;

chai.use(chaiHttp);
const server = getApp();

const result = dotenv.config();
if (result.error) {
  throw result.error;
}
function log(msg: string): void {
  if (process.env.DEBUG === "true") console.log(msg);
}

describe("Server Test", () => {
  describe("/GET health", () => {
    it("it should GET heath data", (done) => {
      chai
        .request(server)
        .get("/health")
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          log(JSON.parse(res.text));
          done();
        });
    });
  });

  describe("/GET user", () => {
    it("it should GET users", (done) => {
      chai
        .request(server)
        .get("/user")
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          log(JSON.parse(res.text));
          done();
        });
    });
  });
});
