import chai from "chai";
import chaiHttp from "chai-http";
import { getApp } from "../server";
import { mockDatabase } from "./setup/setup-db-integration";
import { createFakeUser, newBusinessData, newCustomerData } from "./utils";

const expect = chai.expect;
chai.use(chaiHttp);
const server = getApp();

describe("Auth Service API Test", () => {
  let customerDwollaId;
  let businessDwollaId;

  beforeAll(async () => {
    await mockDatabase.init();
  });

  afterAll(async (): Promise<void> => {
    await mockDatabase.stop();
  });

  it("It should create customer", (done) => {
    chai
      .request(server)
      .post("/users")
      .send(createFakeUser())
      .then((res) => {
        expect(res.body.customer.dwollaId).to.exist;
        expect(res.body.customer.resourceUri).to.exist;
        expect(res.body.dbId).to.exist;
        expect(res.body.verifiedCustomer).to.eql(true);
        expect(res.body.verifiedBusiness).to.eql(false);
        expect(res).to.have.status(201);
        customerDwollaId = res.body.customer.dwollaId;
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it("adds business to existing customer", (done) => {
    chai
      .request(server)
      .post(`/users/${customerDwollaId}/business`)
      .send({
        business: newBusinessData(),
      })
      .then((res) => {
        expect(res).to.have.status(201);
        expect(res.body.data.customer.dwollaId).to.exist;
        expect(res.body.data.customer.resourceUri).to.exist;
        expect(res.body.data.business.dwollaId).to.exist;
        expect(res.body.data.business.resourceUri).to.exist;
        expect(res.body.data.dbId).to.exist;
        expect(res.body.data.verifiedCustomer).to.eql(true);
        expect(res.body.data.verifiedBusiness).to.eql(true);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it("It should create new business", (done) => {
    chai
      .request(server)
      .post("/users")
      .send(createFakeUser(true))
      .then((res) => {
        expect(res.body.business.dwollaId).to.exist;
        expect(res.body.business.resourceUri).to.exist;
        expect(res.body.dbId).to.exist;
        expect(res.body.verifiedCustomer).to.eql(false);
        expect(res.body.verifiedBusiness).to.eql(true);
        expect(res).to.have.status(201);
        businessDwollaId = res.body.business.dwollaId;
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it("adds customer to existing business", (done) => {
    chai
      .request(server)
      .post(`/users/${businessDwollaId}/customer`)
      .send({
        customer: newCustomerData(),
      })
      .then((res) => {
        expect(res).to.have.status(201);
        expect(res.body.data.customer.dwollaId).to.exist;
        expect(res.body.data.customer.resourceUri).to.exist;
        expect(res.body.data.business.dwollaId).to.exist;
        expect(res.body.data.business.resourceUri).to.exist;
        expect(res.body.data.dbId).to.exist;
        expect(res.body.data.verifiedCustomer).to.eql(true);
        expect(res.body.data.verifiedBusiness).to.eql(true);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it("updates customers profile", (done) => {
    chai
      .request(server)
      .put(`/users/${customerDwollaId}/customer/profile`)
      .send({
        customer: { tag: "Latest Tag", avatar: "Latest Avatar" },
      })
      .then((res) => {
        expect(res).to.have.status(200);
        // expect(res.body.data.customer.avatar).to.eql("Latest Avatar");
        expect(res.body.data.customer.tag).to.eql("Latest Tag");
        expect(res.body.data.customer.dwollaId).to.exist;
        expect(res.body.data.customer.dwollaId).to.exist;
        expect(res.body.data.customer.resourceUri).to.exist;
        expect(res.body.data.business.dwollaId).to.exist;
        expect(res.body.data.business.resourceUri).to.exist;
        expect(res.body.data.dbId).to.exist;
        expect(res.body.data.verifiedCustomer).to.eql(true);
        expect(res.body.data.verifiedBusiness).to.eql(true);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it("updates business profile", (done) => {
    chai
      .request(server)
      .put(`/users/${businessDwollaId}/business/profile`)
      .send({
        business: {
          tag: "Latest Tag",
          avatar: "Latest Avatar",
          story: "Latest Story",
          address1: "Latest address1",
          // address2: "de32de",
          // phoneNumber: "dee21e",
          industry: "Updated industry",
          ssn: "Updated SSN",
          ein: "Updated EIN",
          city: "dedew21",
          website: "deadea",
          postalCode: "podea",
          state: "stattt",
        },
      })
      .then((res) => {
        expect(res).to.have.status(200);
        // console.log(res.body);
        // expect(res.body.data.business.avatar).to.eql("Latest Avatar");
        expect(res.body.data.business.tag).to.eql("Latest Tag");
        expect(res.body.data.business.story).to.eql("Latest Story");
        expect(res.body.data.business.address1).to.eql("Latest address1");
        expect(res.body.data.business.ssn).to.eql("Updated SSN");
        expect(res.body.data.business.ein).to.eql("Updated EIN");
        expect(res.body.data.business.industry).to.eql("Updated industry");
        expect(res.body.data.business.address2).to.exist;
        expect(res.body.data.business.dwollaId).to.exist;
        expect(res.body.data.customer.dwollaId).to.exist;
        expect(res.body.data.business.resourceUri).to.exist;
        expect(res.body.data.dbId).to.exist;
        expect(res.body.data.verifiedCustomer).to.eql(true);
        expect(res.body.data.verifiedBusiness).to.eql(true);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});
