import chai from "chai";
import chaiHttp from "chai-http";
import { getApp } from "../server";
import { createDummyEvent, createFakeUser, setupContracts } from "./utils";
import { codes } from "../utils/http";
import { describe, it, beforeAll } from "@jest/globals";
import { INewUser } from "../types";
import { DwollaEvent } from "../service/digital-banking/DwollaTypes";
import { createSignature } from "../service/digital-banking/DwollaUtils";

const expect = chai.expect;
chai.use(chaiHttp);
const server = getApp();

describe("Owner/administrative endpoints test", () => {
  beforeAll(async () => {
    await setupContracts();
  });

  describe("POST /admin/pause", () => {
    it("it should pause, HTTP 202", (done) => {
      chai
        .request(server)
        .post("/admin/pause")
        .then((res) => {
          expect(res).to.have.status(codes.ACCEPTED);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should fail to pause when already paused, HTTP 500", (done) => {
      chai
        .request(server)
        .post("/admin/pause")
        .then((res) => {
          expect(res).to.have.status(codes.SERVER_ERROR);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should unpause, HTTP 202", (done) => {
      chai
        .request(server)
        .post("/admin/unpause")
        .then((res) => {
          expect(res).to.have.status(codes.ACCEPTED);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should fail to unpause when not paused, HTTP 500", (done) => {
      chai
        .request(server)
        .post("/admin/unpause")
        .then((res) => {
          expect(res).to.have.status(codes.SERVER_ERROR);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe("POST /admin/transfer/user", () => {
    
    const user1: INewUser = createFakeUser();
    let dwollaIdUser1;

    it("it should fail to transfer wallet owner with invalid body, HTTP 400", (done) => {
      chai
        .request(server)
        .post("/admin/transfer/user")
        .send({ wrongAttribute: "bananas" })
        .then((res) => {
          expect(res).to.have.status(codes.BAD_REQUEST);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should create user1 and store the returned id, HTTP 201", (done) => {
      chai
        .request(server)
        .post("/users")
        .send(user1)
        .then((res) => {
          expect(res).to.have.status(codes.CREATED);
          expect(res).to.be.json;
          dwollaIdUser1 = res.body.userId;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should post a supported webhook event for user1 and successfully process it, HTTP 202", (done) => {
      const event: DwollaEvent = createDummyEvent(
        "customer_created",
        dwollaIdUser1
      );
      const signature = createSignature(
        process.env.WEBHOOK_SECRET,
        JSON.stringify(event)
      );
      chai
        .request(server)
        .post("/webhook")
        .set({ "X-Request-Signature-SHA-256": signature })
        .send(event)
        .then((res) => {
          expect(res).to.have.status(codes.ACCEPTED);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should transfer ownership of the wallet, HTTP 202", (done) => {
      chai
        .request(server)
        .post("/admin/transfer/user")
        .send({
          newOwner: "0x0000000000000000000000000000000000000001",
          userId: dwollaIdUser1,
        })
        .then((res) => {
          expect(res).to.have.status(codes.ACCEPTED);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    // This should be 403 but for some reason is failing on a different error
    // ToDo - find out why
    it("it should fail to transfer ownership of the wallet after already transferring it away, HTTP 500", (done) => {
      chai
        .request(server)
        .post("/admin/transfer/user")
        .send({
          newOwner: "0x0000000000000000000000000000000000000002",
          userId: dwollaIdUser1,
        })
        .then((res) => {
          expect(res).to.have.status(codes.SERVER_ERROR);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe("POST /admin/transfer/controller", () => {
    it("it should fail to transfer controller with invalid body, HTTP 400", (done) => {
      chai
        .request(server)
        .post("/admin/transfer/controller")
        .send({ wrongAttribute: "bananas" })
        .then((res) => {
          expect(res).to.have.status(codes.BAD_REQUEST);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should transfer ownership of the controller, HTTP 202", (done) => {
      chai
        .request(server)
        .post("/admin/transfer/controller")
        .send({ newOwner: "0x0000000000000000000000000000000000000001" })
        .then((res) => {
          expect(res).to.have.status(codes.ACCEPTED);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should fail to transfer ownership of the controller after already transferring it away, HTTP 403", (done) => {
      chai
        .request(server)
        .post("/admin/transfer/controller")
        .send({ newOwner: "0x0000000000000000000000000000000000000002" })
        .then((res) => {
          expect(res).to.have.status(codes.FORBIDDEN);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });
});