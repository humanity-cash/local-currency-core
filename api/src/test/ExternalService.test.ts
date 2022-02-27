import { describe, it } from "@jest/globals";
import chai from "chai";
import chaiHttp from "chai-http";
import { getApp } from "../server";
import { log } from "../utils";
import { codes } from "../utils/http";

const expect = chai.expect;
chai.use(chaiHttp);
const server = getApp();

describe("External service test", () => {
  
  describe("POST /user/:id/cache/profilePicture", () => {

    it("it should purge a known image URL", (done) => {
      chai
        .request(server)
        .post("/users/953408b2-98e4-40f1-8138-1701ad954f36/cache/profilePicture")
        .then((res) => {
          log(JSON.parse(res.text));
          expect(res).to.have.status(codes.OK);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    // This actually succeeds on Imgix
    xit("it should fail to purge an unknown image URL", (done) => {
        chai
          .request(server)
          .post("/users/bananas/cache/profilePicture")
          .then((res) => {
            log(JSON.parse(res.text));
            expect(res).to.have.status(codes.NOT_FOUND);
            done();
          })
          .catch((err) => {
            done(err);
          });
      });
  });
});
