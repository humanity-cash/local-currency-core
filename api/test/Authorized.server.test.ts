import dotenv from "dotenv";
import chai from "chai";
import path from "path";
import chaiHttp from "chai-http";
import { getApp } from "../src/server";
import { log, setupContracts } from "./utils";
import { v4 } from "uuid";
import { codes } from "../src/utils/http";
import { IWallet } from "../src/types"

const expect = chai.expect;
chai.use(chaiHttp);
const server = getApp();

const result = dotenv.config({
  path: path.resolve(process.cwd(), ".env.test"),
});
if (result.error) {
  throw result.error;
}

describe("Server Test", () => {

  let user1 : IWallet;
  let user1Id = v4();
  let user2 : IWallet;
  let user2Id = v4();
  
  beforeAll(async () => {
    await setupContracts();
  });

  describe("GET /health", () => {
    
    it("it should retrieve heath data", (done) => {
      chai
        .request(server)
        .get("/health")
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          log(JSON.parse(res.text));
          done();
        })
       .catch((err) => {
          throw err;
        });
    });

  });

  describe("POST /users (create user)", () => {
    
    it("it should create a new user and store the returned address", (done) => {
      chai
        .request(server)
        .post("/users")
        .send({ userId: user1Id })
        .then((res) => {
          expect(res).to.have.status(codes.CREATED);
          expect(res).to.be.json;
          log(JSON.parse(res.text));
          user1 = JSON.parse(res.text);
          log(user1);     
          done();     
        })
       .catch((err) => {
          throw err;
        });
    });

    it("it should create another new user and store the returned address", (done) => {
      chai
        .request(server)
        .post("/users")
        .send({ userId: user2Id })
        .then((res) => {
          expect(res).to.have.status(codes.CREATED);
          expect(res).to.be.json;
          log(JSON.parse(res.text));
          user2 = JSON.parse(res.text);
          log(user2);  
          done();        
        })
       .catch((err) => {
          throw err;
        });
    });
  });

  describe("POST /users/:userId/deposit (deposit for user)", () => {

    it("it should deposit to user1", (done) => {
      chai
        .request(server)
        .post(`/users/${user1Id}/deposit`)
        .send({ amount: "99.99" })
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          expect(res).to.be.json;  
          done();     
        })
       .catch((err) => {
          throw err;
        });
    });

    it("it should deposit to user2", (done) => {
      chai
        .request(server)
        .post(`/users/${user2Id}/deposit`)
        .send({ amount: "22.22" })
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          expect(res).to.be.json;    
          done();   
        })
       .catch((err) => {
          throw err;
        });
    });

    it("it should deposit again to user2", (done) => {
      chai
        .request(server)
        .post(`/users/${user2Id}/deposit`)
        .send({ amount: "11.11" })
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          expect(res).to.be.json;  
          done();     
        })
       .catch((err) => {
          throw err;
        });
    });

    it("it should deposit again to user2", (done) => {
      chai
        .request(server)
        .post(`/users/${user2Id}/deposit`)
        .send({ amount: "33.33" })
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

  describe("POST /users/:userId/withdraw (withdraw for user)", () => {

    it("it should withdraw from user2", (done) => {
      chai
        .request(server)
        .post(`/users/${user2Id}/withdraw`)
        .send({ amount: "5.55" })
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          expect(res).to.be.json;    
          done();   
        })
       .catch((err) => {
          throw err;
        });
    });

    it("it should withdraw from user1", (done) => {
      chai
        .request(server)
        .post(`/users/${user1Id}/withdraw`)
        .send({ amount: "7.77" })
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          expect(res).to.be.json;    
          done();   
        })
       .catch((err) => {
          throw err;
        });
    });
    
    it("it should withdraw again from user1", (done) => {
      chai
        .request(server)
        .post(`/users/${user1Id}/withdraw`)
        .send({ amount: "77.77" })
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

  describe("POST /users/:userId/transfer (make a payment for user)", () => {

    it("it should transfer user1 to user2", (done) => {
      chai
        .request(server)
        .post(`/users/${user1Id}/transfer`)
        .send({ toUserId: user2Id, amount: "1.11" })
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          expect(res).to.be.json;    
          done();   
        })
       .catch((err) => {
          throw err;
        });
    });

    it("it should transfer user2 to user1", (done) => {
      chai
        .request(server)
        .post(`/users/${user2Id}/transfer`)
        .send({ toUserId: user1Id, amount: "12.12" })
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          expect(res).to.be.json;       
          done();
        })
       .catch((err) => {
          throw err;
        });
    });
    
    it("it should fail to transfer a very large amount from user1 to user2", (done) => {
      chai
        .request(server)
        .post(`/users/${user1Id}/transfer`)
        .send({ toUserId: user2Id, amount: "99999999999999999" })
        .then((res) => {
          expect(res).to.have.status(codes.SERVER_ERROR);
          expect(res).to.be.json;
          done();
        })
       .catch((err) => {
          throw err;
        });
    }); 

    it("it should fail to transfer $0 from user2 to user1", (done) => {
      chai
        .request(server)
        .post(`/users/${user2Id}/transfer`)
        .send({ toUserId: user1Id, amount: "0" })
        .then((res) => {
          expect(res).to.have.status(codes.SERVER_ERROR);
          expect(res).to.be.json;
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
          done();     
        })
       .catch((err) => {
          throw err;
        });
    }); 
    
    it("it should get user2", (done) => {
      chai
        .request(server)
        .get(`/users/${user2Id}`)
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          expect(res).to.be.json;      
          done(); 
        })
       .catch((err) => {
          throw err;
        });
    }); 
    
    it("it should get all users", (done) => {
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