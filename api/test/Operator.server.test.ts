import dotenv from "dotenv";
import chai from "chai";
import path from "path";
import chaiHttp from "chai-http";
import { describe, it, beforeAll } from "@jest/globals";
import { getApp } from "../src/server";
import { log, setupContracts, getSalt, createDummyEvent } from "./utils";
import { codes } from "../src/utils/http";
import { cryptoUtils } from "../src/utils";
import { INewUser } from "../src/types";
import faker from "faker";
import { createSignature } from "../src/service/digital-banking/DwollaUtils";
import { DwollaEvent } from "../src/service/digital-banking/DwollaTypes";

const expect = chai.expect;
chai.use(chaiHttp);
const server = getApp();

const result = dotenv.config({
  path: path.resolve(process.cwd(), ".env.test"),
});
if (result.error) {
  throw result.error;
}

function createFakeUser(isBusiness?: false): INewUser {
  const user: INewUser = {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    address1: faker.address.streetAddress(),
    address2: faker.address.secondaryAddress(),
    city: faker.address.city(),
    postalCode: faker.address.zipCode(),
    state: faker.address.stateAbbr(),
    email: getSalt() + faker.internet.email(),
    ipAddress: faker.internet.ip().toString(),
    userId: "",
    businessName: isBusiness
      ? faker.name.lastName + "'s fake business"
      : undefined,
  };
  user.userId = cryptoUtils.toBytes32(user.email);
  log(user);
  return user;
}

function expectIWallet(wallet: unknown): void {
  log(wallet);
  expect(wallet).to.have.property("userId");
  expect(wallet).to.have.property("address");
  expect(wallet).to.have.property("createdBlock");
  expect(wallet).to.have.property("availableBalance");
  expect(wallet).to.have.property("totalBalance");
}

function expectIDeposit(deposit: unknown): void {
  log(deposit);
  expect(deposit).to.have.property("transactionHash");
  expect(deposit).to.have.property("blockNumber");
  expect(deposit).to.have.property("timestamp");
  expect(deposit).to.have.property("operator");
  expect(deposit).to.have.property("userId");
  expect(deposit).to.have.property("value");
}

function expectIWithdrawal(withdrawal: unknown): void {
  log(withdrawal);
  expect(withdrawal).to.have.property("transactionHash");
  expect(withdrawal).to.have.property("blockNumber");
  expect(withdrawal).to.have.property("timestamp");
  expect(withdrawal).to.have.property("operator");
  expect(withdrawal).to.have.property("userId");
  expect(withdrawal).to.have.property("value");
}

function expectITransferEvent(transfer: unknown): void {
  log(transfer);
  expect(transfer).to.have.property("transactionHash");
  expect(transfer).to.have.property("blockNumber");
  expect(transfer).to.have.property("timestamp");
  expect(transfer).to.have.property("fromUserId");
  expect(transfer).to.have.property("fromAddress");
  expect(transfer).to.have.property("toUserId");
  expect(transfer).to.have.property("toAddress");
  expect(transfer).to.have.property("value");
}

describe("Operator endpoints test", () => {
  const user1: INewUser = createFakeUser();
  const user2: INewUser = createFakeUser();

  beforeAll(async () => {
    await setupContracts();
  });

  describe("POST /users (create user)", () => {
    it("it should create user1 and store the returned address, HTTP 201", (done) => {
      chai
        .request(server)
        .post("/users")
        .send(user1)
        .then((res) => {
          expect(res).to.have.status(codes.CREATED);
          expect(res).to.be.json;
          user1.userId = res.body.id;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should post a supported webhook event for user1 and successfully process it, HTTP 202", (done) => {
      const event: DwollaEvent = createDummyEvent(
        "customer_created",
        user1.userId
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
          log(JSON.parse(res.text));
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should create user2 and store the returned address, HTTP 201", (done) => {
      chai
        .request(server)
        .post("/users")
        .send(user2)
        .then((res) => {
          expect(res).to.have.status(codes.CREATED);
          expect(res).to.be.json;
          user2.userId = res.body.id;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should post a supported webhook event for user2 and successfully process it, HTTP 202", (done) => {
      const event: DwollaEvent = createDummyEvent(
        "customer_created",
        user2.userId
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
          log(JSON.parse(res.text));
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should fail to create user2 twice, HTTP 500", (done) => {
      chai
        .request(server)
        .post("/users")
        .send(user2)
        .then((res) => {
          expect(res).to.have.status(codes.SERVER_ERROR);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should fail to create a new user with invalid body, HTTP 400", (done) => {
      chai
        .request(server)
        .post("/users")
        .send({ test: "junk body" })
        .then((res) => {
          expect(res).to.have.status(codes.BAD_REQUEST);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe("POST /users/:userId/deposit (deposit for user)", () => {
    it("it should return HTTP 400 with invalid body", (done) => {
      chai
        .request(server)
        .post(`/users/${user1.userId}/deposit`)
        .send({ banana: "99.99" })
        .then((res) => {
          expect(res).to.have.status(codes.BAD_REQUEST);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should return HTTP 422 with Solidity reversion (negative deposit)", (done) => {
      chai
        .request(server)
        .post(`/users/${user2.userId}/deposit`)
        .send({ amount: "-1.0" })
        .then((res) => {
          expect(res).to.have.status(codes.UNPROCESSABLE);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should return HTTP 422 with Solidity reversion (zero value deposit)", (done) => {
      chai
        .request(server)
        .post(`/users/${user1.userId}/deposit`)
        .send({ amount: "0" })
        .then((res) => {
          expect(res).to.have.status(codes.UNPROCESSABLE);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should return HTTP 404 with Solidity reversion (user doesn't exist)", (done) => {
      chai
        .request(server)
        .post(`/users/userthatdoesntexist/deposit`)
        .send({ amount: "1.0" })
        .then((res) => {
          expect(res).to.have.status(codes.NOT_FOUND);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should deposit to user1, HTTP 202", (done) => {
      chai
        .request(server)
        .post(`/users/${user1.userId}/deposit`)
        .send({ amount: "99.99" })
        .then((res) => {
          expect(res).to.have.status(codes.ACCEPTED);
          expect(res).to.be.json;
          expectIWallet(res.body);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should deposit to user2, HTTP 202", (done) => {
      chai
        .request(server)
        .post(`/users/${user2.userId}/deposit`)
        .send({ amount: "22.22" })
        .then((res) => {
          expect(res).to.have.status(codes.ACCEPTED);
          expect(res).to.be.json;
          expectIWallet(res.body);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should deposit again to user2, HTTP 202", (done) => {
      chai
        .request(server)
        .post(`/users/${user2.userId}/deposit`)
        .send({ amount: "11.11" })
        .then((res) => {
          expect(res).to.have.status(codes.ACCEPTED);
          expect(res).to.be.json;
          expectIWallet(res.body);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should deposit again to user2, HTTP 202", (done) => {
      chai
        .request(server)
        .post(`/users/${user2.userId}/deposit`)
        .send({ amount: "33.33" })
        .then((res) => {
          expect(res).to.have.status(codes.ACCEPTED);
          expect(res).to.be.json;
          expectIWallet(res.body);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe("GET /users/:userId/deposit (get deposits(s) for user)", () => {
    it("it should return HTTP 404 with Solidity reversion (user doesn't exist)", (done) => {
      chai
        .request(server)
        .get(`/users/fakeUser123/deposit`)
        .send()
        .then((res) => {
          expect(res).to.have.status(codes.NOT_FOUND);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should return 1 deposit for user1, HTTP 200", (done) => {
      chai
        .request(server)
        .get(`/users/${user1.userId}/deposit`)
        .send()
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          expect(res).to.be.json;
          expect(res.body.length).to.equal(1);
          expectIDeposit(res.body[0]);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should return 3 deposits for user2, HTTP 200", (done) => {
      chai
        .request(server)
        .get(`/users/${user2.userId}/deposit`)
        .send()
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          expect(res).to.be.json;
          expect(res.body.length).to.equal(3);
          for (let i = 0; i < res.body.length; i++) {
            expectIDeposit(res.body[i]);
          }
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe("POST /users/:userId/withdraw (withdraw for user)", () => {
    it("it should return HTTP 400 with invalid body", (done) => {
      chai
        .request(server)
        .post(`/users/${user1.userId}/withdraw`)
        .send({ banana: "99.99" })
        .then((res) => {
          expect(res).to.have.status(codes.BAD_REQUEST);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should return HTTP 422 (negative withdrawal)", (done) => {
      chai
        .request(server)
        .post(`/users/${user1.userId}/withdraw`)
        .send({ amount: "-1.0" })
        .then((res) => {
          expect(res).to.have.status(codes.UNPROCESSABLE);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should return HTTP 422 (zero value withdrawal)", (done) => {
      chai
        .request(server)
        .post(`/users/${user1.userId}/withdraw`)
        .send({ amount: "0" })
        .then((res) => {
          expect(res).to.have.status(codes.UNPROCESSABLE);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should withdraw from user2, HTTP 202", (done) => {
      chai
        .request(server)
        .post(`/users/${user2.userId}/withdraw`)
        .send({ amount: "5.55" })
        .then((res) => {
          expect(res).to.have.status(codes.ACCEPTED);
          expect(res).to.be.json;
          expectIWallet(res.body);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should withdraw from user1, HTTP 202", (done) => {
      chai
        .request(server)
        .post(`/users/${user1.userId}/withdraw`)
        .send({ amount: "7.77" })
        .then((res) => {
          expect(res).to.have.status(codes.ACCEPTED);
          expect(res).to.be.json;
          expectIWallet(res.body);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should withdraw again from user1, HTTP 202", (done) => {
      chai
        .request(server)
        .post(`/users/${user1.userId}/withdraw`)
        .send({ amount: "77.77" })
        .then((res) => {
          expect(res).to.have.status(codes.ACCEPTED);
          expect(res).to.be.json;
          expectIWallet(res.body);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe("GET /users/:userId/withdraw (get withdrawal(s) for user)", () => {
    it("it should return HTTP 422 with Solidity reversion (user doesn't exist)", (done) => {
      chai
        .request(server)
        .get(`/users/fakeUser123/withdraw`)
        .send()
        .then((res) => {
          expect(res).to.have.status(codes.NOT_FOUND);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should return 2 withdrawals for user1, HTTP 200", (done) => {
      chai
        .request(server)
        .get(`/users/${user1.userId}/withdraw`)
        .send()
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          expect(res).to.be.json;
          expect(res.body.length).to.equal(2);
          for (let i = 0; i < res.body.length; i++) {
            expectIWithdrawal(res.body[i]);
          }
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should return 1 withdrawals for user1, HTTP 200", (done) => {
      chai
        .request(server)
        .get(`/users/${user2.userId}/withdraw`)
        .send()
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          expect(res).to.be.json;
          expect(res.body.length).to.equal(1);
          for (let i = 0; i < res.body.length; i++) {
            expectIWithdrawal(res.body[i]);
          }
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe("POST /users/:userId/transfer (make a payment for user)", () => {
    it("it should return HTTP 400 with invalid body", (done) => {
      chai
        .request(server)
        .post(`/users/${user1.userId}/transfer`)
        .send({ test: "junk body", amount: "1.11" })
        .then((res) => {
          expect(res).to.have.status(codes.BAD_REQUEST);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should return HTTP 422 with Solidity reversion (negative transfer)", (done) => {
      chai
        .request(server)
        .post(`/users/${user1.userId}/transfer`)
        .send({ toUserId: user2.userId, amount: "-1.11" })
        .then((res) => {
          expect(res).to.have.status(codes.UNPROCESSABLE);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should return HTTP 422 with Solidity reversion (zero value transfer)", (done) => {
      chai
        .request(server)
        .post(`/users/${user1.userId}/transfer`)
        .send({ toUserId: user2.userId, amount: "0" })
        .then((res) => {
          expect(res).to.have.status(codes.UNPROCESSABLE);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should transfer user1 to user2, HTTP 202", (done) => {
      chai
        .request(server)
        .post(`/users/${user1.userId}/transfer`)
        .send({ toUserId: user2.userId, amount: "1.11" })
        .then((res) => {
          expect(res).to.have.status(codes.ACCEPTED);
          expect(res).to.be.json;
          expectIWallet(res.body);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should transfer user2 to user1, HTTP 202", (done) => {
      chai
        .request(server)
        .post(`/users/${user2.userId}/transfer`)
        .send({ toUserId: user1.userId, amount: "12.12" })
        .then((res) => {
          expect(res).to.have.status(codes.ACCEPTED);
          expect(res).to.be.json;
          expectIWallet(res.body);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should fail to transfer a very large amount from user1 to user2, HTTP 422", (done) => {
      chai
        .request(server)
        .post(`/users/${user1.userId}/transfer`)
        .send({ toUserId: user2.userId, amount: "99999999999999999" })
        .then((res) => {
          expect(res).to.have.status(codes.UNPROCESSABLE);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe("GET /users/:userId/transfer (get transfer(s) for user(s))", () => {
    it("it should get 1 transfer for user1, HTTP 200", (done) => {
      chai
        .request(server)
        .get(`/users/${user1.userId}/transfer`)
        .send()
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          expect(res).to.be.json;
          log(res.body);
          expect(res.body.length).to.equal(1);
          for (let i = 0; i < res.body.length; i++) {
            expectITransferEvent(res.body[i]);
          }
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should get 1 transfer for user2, HTTP 200", (done) => {
      chai
        .request(server)
        .get(`/users/${user2.userId}/transfer`)
        .send()
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          expect(res).to.be.json;
          log(res.body);
          expect(res.body.length).to.equal(1);
          for (let i = 0; i < res.body.length; i++) {
            expectITransferEvent(res.body[i]);
          }
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe("GET /users (get user(s))", () => {
    it("it should get user1", (done) => {
      chai
        .request(server)
        .get(`/users/${user1.userId}`)
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          expect(res).to.be.json;
          expect(res.body.length).to.equal(1);
          expectIWallet(res.body[0]);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should get user2, HTTP 200", (done) => {
      chai
        .request(server)
        .get(`/users/${user2.userId}`)
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          expect(res).to.be.json;
          expect(res.body.length).to.equal(1);
          expectIWallet(res.body[0]);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should fail to get an unknown user, HTTP 404", (done) => {
      chai
        .request(server)
        .get(`/users/banana1`)
        .then((res) => {
          expect(res).to.have.status(codes.NOT_FOUND);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should get all users, HTTP 200", (done) => {
      chai
        .request(server)
        .get("/users")
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          expect(res).to.be.json;
          for (let i = 0; i < res.body.length; i++) {
            expectIWallet(res.body[i]);
          }
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe("GET /stats", () => {
    it("GET /stats/deposit: it should retrieve all deposits, HTTP 200", (done) => {
      chai
        .request(server)
        .get("/stats/deposit")
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          log(JSON.parse(res.text));
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("GET /stats/withdrawal: it should retrieve all withdrawals, HTTP 200", (done) => {
      chai
        .request(server)
        .get("/stats/withdrawal")
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          log(JSON.parse(res.text));
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("GET /stats/operator: it should retrieve operator statistics, HTTP 200", (done) => {
      chai
        .request(server)
        .get("/stats/operator")
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          log(JSON.parse(res.text));
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("GET /stats/transfer: it should retrieve all transfers, HTTP 200", (done) => {
      chai
        .request(server)
        .get("/stats/transfer")
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
