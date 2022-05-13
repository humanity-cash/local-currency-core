import { beforeAll, describe, it } from "@jest/globals";
import chai from "chai";
import chaiHttp from "chai-http";
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
      chai
        .request(server)
        .get("/health")
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
          expect(res.body).to.haveOwnProperty("controllerStatus");
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe("GET /content", () => {
    it("it should retrieve content data", (done) => {
      chai
        .request(server)
        .get("/content")
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          log(JSON.parse(res.text));
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should retrieve 6 pieces of random content data ", (done) => {
      chai
        .request(server)
        .get("/content?random=6")
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          expect(res.body.length).to.equal(6);
          log(JSON.parse(res.text));
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should retrieve a limit of 3 pieces of content data ", (done) => {
      chai
        .request(server)
        .get("/content?limit=3")
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          expect(res.body.length).to.equal(3);
          log(JSON.parse(res.text));
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should retrieve a limited set of 6 content pieces from 10 random content data ", (done) => {
      chai
        .request(server)
        .get("/content?random=10&limit=6")
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          expect(res.body.length).to.equal(6);
          log(JSON.parse(res.text));
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should retrieve only Heroes type content", (done) => {
      chai
        .request(server)
        .get("/content?type=Heroes")
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          expect(res.body.length).to.equal(5);
          log(JSON.parse(res.text));
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should retrieve only Heroes type content but in random order", (done) => {
      chai
        .request(server)
        .get("/content?type=Heroes&random=5")
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          expect(res.body.length).to.equal(5);
          log(JSON.parse(res.text));
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should retrieve only 3 Featured Artists type content", (done) => {
      chai
        .request(server)
        .get("/content?type=FeaturedArtists&limit=3")
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          expect(res.body.length).to.equal(3);
          log(JSON.parse(res.text));
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });
});
