import dotenv from "dotenv";
import chai from "chai";
import path from "path";
import chaiHttp from "chai-http";
import { getApp } from "../src/server";
import { log, setupContracts } from "./utils";
import { v4 } from "uuid";
import { codes } from "../src/utils/http";
import { IWallet } from "../src/types";

const expect = chai.expect;
chai.use(chaiHttp);
const server = getApp();

const result = dotenv.config({
  path: path.resolve(process.cwd(), ".env.test"),
});
if (result.error) {
  throw result.error;
}

describe("Operator endpoints test", () => {
  let user1: IWallet;
  const user1Id = v4();
  let user2: IWallet;
  const user2Id = v4();

  beforeAll(async () => {
    await setupContracts();
  });

  describe("POST /users (create user)", () => {
    it("it should create a new user and store the returned address, HTTP 201", (done) => {
      chai
        .request(server)
        .post("/users")
        .send({ userId: user1Id })
        .then((res) => {
          expect(res).to.have.status(codes.CREATED);
          expect(res).to.be.json;
          user1 = JSON.parse(res.text);
          log(user1);
          done();
        })
        .catch((err) => {
          throw err;
        });
    });

    it("it should create another new user and store the returned address, HTTP 201", (done) => {
      chai
        .request(server)
        .post("/users")
        .send({ userId: user2Id })
        .then((res) => {
          expect(res).to.have.status(codes.CREATED);
          expect(res).to.be.json;
          user2 = JSON.parse(res.text);
          log(user2);
          done();
        })
        .catch((err) => {
          throw err;
        });
    });

    it("it should fail to create another new user with the same userId, HTTP 422", (done) => {
      chai
        .request(server)
        .post("/users")
        .send({ userId: user2Id })
        .then((res) => {
          expect(res).to.have.status(codes.UNPROCESSABLE);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          throw err;
        });
    });

    it("it should fail to create another new user with invalid body, HTTP 400", (done) => {
      chai
        .request(server)
        .post("/users")
        .send({ bananaId: user2Id })
        .then((res) => {
          expect(res).to.have.status(codes.BAD_REQUEST);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          throw err;
        });
    });
  });

  describe("POST /users/:userId/deposit (deposit for user)", () => {
    it("it should return HTTP 400 with invalid body", (done) => {
      chai
        .request(server)
        .post(`/users/${user1Id}/deposit`)
        .send({ banana: "99.99" })
        .then((res) => {
          expect(res).to.have.status(codes.BAD_REQUEST);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          throw err;
        });
    });

    it("it should return HTTP 422 with Solidity reversion (negative deposit)", (done) => {
      chai
        .request(server)
        .post(`/users/${user1Id}/deposit`)
        .send({ amount: "-1.0" })
        .then((res) => {
          expect(res).to.have.status(codes.UNPROCESSABLE);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          throw err;
        });
    });

    it("it should return HTTP 422 with Solidity reversion (zero value deposit)", (done) => {
      chai
        .request(server)
        .post(`/users/${user1Id}/deposit`)
        .send({ amount: "0" })
        .then((res) => {
          expect(res).to.have.status(codes.UNPROCESSABLE);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          throw err;
        });
    });

    it("it should return HTTP 422 with Solidity reversion (user doesn't exist)", (done) => {
      chai
        .request(server)
        .post(`/users/userthatdoesntexist/deposit`)
        .send({ amount: "1.0" })
        .then((res) => {
          expect(res).to.have.status(codes.UNPROCESSABLE);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          throw err;
        });
    });

    it("it should deposit to user1, HTTP 202", (done) => {
      chai
        .request(server)
        .post(`/users/${user1Id}/deposit`)
        .send({ amount: "99.99" })
        .then((res) => {
          expect(res).to.have.status(codes.ACCEPTED);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          throw err;
        });
    });

    it("it should deposit to user2, HTTP 202", (done) => {
      chai
        .request(server)
        .post(`/users/${user2Id}/deposit`)
        .send({ amount: "22.22" })
        .then((res) => {
          expect(res).to.have.status(codes.ACCEPTED);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          throw err;
        });
    });

    it("it should deposit again to user2, HTTP 202", (done) => {
      chai
        .request(server)
        .post(`/users/${user2Id}/deposit`)
        .send({ amount: "11.11" })
        .then((res) => {
          expect(res).to.have.status(codes.ACCEPTED);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          throw err;
        });
    });

    it("it should deposit again to user2, HTTP 202", (done) => {
      chai
        .request(server)
        .post(`/users/${user2Id}/deposit`)
        .send({ amount: "33.33" })
        .then((res) => {
          expect(res).to.have.status(codes.ACCEPTED);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          throw err;
        });
    });
  });

  describe("GET /users/:userId/deposit (get deposits(s) for user)", () => {
    it("it should return HTTP 422 with Solidity reversion (user doesn't exist)", (done) => {
      chai
        .request(server)
        .get(`/users/fakeUser123/deposit`)
        .send()
        .then((res) => {
          expect(res).to.have.status(codes.UNPROCESSABLE);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          throw err;
        });
    });

    it("it should return 1 deposit for user1, HTTP 200", (done) => {
      chai
        .request(server)
        .get(`/users/${user1Id}/deposit`)
        .send()
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          expect(res).to.be.json;
          expect(res.body.length).to.equal(1);
          done();
        })
        .catch((err) => {
          throw err;
        });
    });

    it("it should return 3 deposits for user2, HTTP 200", (done) => {
      chai
        .request(server)
        .get(`/users/${user2Id}/deposit`)
        .send()
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          expect(res).to.be.json;
          log(res.body);
          expect(res.body.length).to.equal(3);
          done();
        })
        .catch((err) => {
          throw err;
        });
    });
  });

  describe("POST /users/:userId/withdraw (withdraw for user)", () => {
    it("it should return HTTP 400 with invalid body", (done) => {
      chai
        .request(server)
        .post(`/users/${user1Id}/withdraw`)
        .send({ banana: "99.99" })
        .then((res) => {
          expect(res).to.have.status(codes.BAD_REQUEST);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          throw err;
        });
    });

    it("it should return HTTP 422 (negative withdrawal)", (done) => {
      chai
        .request(server)
        .post(`/users/${user1Id}/withdraw`)
        .send({ amount: "-1.0" })
        .then((res) => {
          expect(res).to.have.status(codes.UNPROCESSABLE);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          throw err;
        });
    });

    it("it should return HTTP 422 (zero value withdrawal)", (done) => {
      chai
        .request(server)
        .post(`/users/${user1Id}/withdraw`)
        .send({ amount: "0" })
        .then((res) => {
          expect(res).to.have.status(codes.UNPROCESSABLE);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          throw err;
        });
    });

    it("it should withdraw from user2, HTTP 202", (done) => {
      chai
        .request(server)
        .post(`/users/${user2Id}/withdraw`)
        .send({ amount: "5.55" })
        .then((res) => {
          expect(res).to.have.status(codes.ACCEPTED);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          throw err;
        });
    });

    it("it should withdraw from user1, HTTP 202", (done) => {
      chai
        .request(server)
        .post(`/users/${user1Id}/withdraw`)
        .send({ amount: "7.77" })
        .then((res) => {
          expect(res).to.have.status(codes.ACCEPTED);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          throw err;
        });
    });

    it("it should withdraw again from user1, HTTP 202", (done) => {
      chai
        .request(server)
        .post(`/users/${user1Id}/withdraw`)
        .send({ amount: "77.77" })
        .then((res) => {
          expect(res).to.have.status(codes.ACCEPTED);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          throw err;
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
          expect(res).to.have.status(codes.UNPROCESSABLE);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          throw err;
        });
    });

    it("it should return 2 withdrawals for user1, HTTP 200", (done) => {
      chai
        .request(server)
        .get(`/users/${user1Id}/withdraw`)
        .send()
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          expect(res).to.be.json;
          expect(res.body.length).to.equal(2);
          done();
        })
        .catch((err) => {
          throw err;
        });
    });

    it("it should return 1 withdrawals for user1, HTTP 200", (done) => {
      chai
        .request(server)
        .get(`/users/${user2Id}/withdraw`)
        .send()
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          expect(res).to.be.json;
          log(res.body);
          expect(res.body.length).to.equal(1);
          done();
        })
        .catch((err) => {
          throw err;
        });
    });
  });

  describe("POST /users/:userId/transfer (make a payment for user)", () => {
    it("it should return HTTP 400 with invalid body", (done) => {
      chai
        .request(server)
        .post(`/users/${user1Id}/transfer`)
        .send({ banana: user2Id, amount: "1.11" })
        .then((res) => {
          expect(res).to.have.status(codes.BAD_REQUEST);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          throw err;
        });
    });

    it("it should return HTTP 422 with Solidity reversion (negative transfer)", (done) => {
      chai
        .request(server)
        .post(`/users/${user1Id}/transfer`)
        .send({ toUserId: user2Id, amount: "-1.11" })
        .then((res) => {
          expect(res).to.have.status(codes.UNPROCESSABLE);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          throw err;
        });
    });

    it("it should return HTTP 422 with Solidity reversion (zero value transfer)", (done) => {
      chai
        .request(server)
        .post(`/users/${user1Id}/transfer`)
        .send({ toUserId: user2Id, amount: "0" })
        .then((res) => {
          expect(res).to.have.status(codes.UNPROCESSABLE);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          throw err;
        });
    });

    it("it should transfer user1 to user2, HTTP 202", (done) => {
      chai
        .request(server)
        .post(`/users/${user1Id}/transfer`)
        .send({ toUserId: user2Id, amount: "1.11" })
        .then((res) => {
          expect(res).to.have.status(codes.ACCEPTED);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          throw err;
        });
    });

    it("it should transfer user2 to user1, HTTP 202", (done) => {
      chai
        .request(server)
        .post(`/users/${user2Id}/transfer`)
        .send({ toUserId: user1Id, amount: "12.12" })
        .then((res) => {
          expect(res).to.have.status(codes.ACCEPTED);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          throw err;
        });
    });

    it("it should fail to transfer a very large amount from user1 to user2, HTTP 422", (done) => {
      chai
        .request(server)
        .post(`/users/${user1Id}/transfer`)
        .send({ toUserId: user2Id, amount: "99999999999999999" })
        .then((res) => {
          expect(res).to.have.status(codes.UNPROCESSABLE);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          throw err;
        });
    });
  });

  describe("GET /users/:userId/transfer (get transfer(s) for user(s))", () => {
    it("it should get 1 transfer for user1, HTTP 200", (done) => {
      chai
        .request(server)
        .get(`/users/${user1Id}/transfer`)
        .send()
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          expect(res).to.be.json;
          log(res.body);
          expect(res.body.length).to.equal(1);
          done();
        })
        .catch((err) => {
          throw err;
        });
    });

    it("it should get 1 transfer for user2, HTTP 200", (done) => {
      chai
        .request(server)
        .get(`/users/${user2Id}/transfer`)
        .send()
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          expect(res).to.be.json;
          log(res.body);
          expect(res.body.length).to.equal(1);
          done();
        })
        .catch((err) => {
          throw err;
        });
    });
  });

  describe("GET /users (get user(s))", () => {
    it("it should get user1", (done) => {
      chai
        .request(server)
        .get(`/users/${user1Id}`)
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          expect(res).to.be.json;
          expect(res.body.length).to.equal(1);
          expect(res.body[0]).to.have.property("userId");
          expect(res.body[0]).to.have.property("address");
          expect(res.body[0]).to.have.property("createdBlock");
          expect(res.body[0]).to.have.property("availableBalance");
          expect(res.body[0]).to.have.property("totalBalance");
          log(res.body);
          done();
        })
        .catch((err) => {
          throw err;
        });
    });

    it("it should get user2, HTTP 200", (done) => {
      chai
        .request(server)
        .get(`/users/${user2Id}`)
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          expect(res).to.be.json;
          expect(res.body.length).to.equal(1);
          expect(res.body[0]).to.have.property("userId");
          expect(res.body[0]).to.have.property("address");
          expect(res.body[0]).to.have.property("createdBlock");
          expect(res.body[0]).to.have.property("availableBalance");
          expect(res.body[0]).to.have.property("totalBalance");
          done();
        })
        .catch((err) => {
          throw err;
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
          throw err;
        });
    });

    it("it should get all users, HTTP 200", (done) => {
      chai
        .request(server)
        .get("/users")
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          throw err;
        });
    });
  });
});