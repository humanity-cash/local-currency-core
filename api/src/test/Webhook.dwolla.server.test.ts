import chai from "chai";
import chaiHttp from "chai-http";
import { getApp } from "../server";
import { setupContracts, getSalt, createDummyEvent } from "./utils";
import { log } from "../utils";
import { codes } from "../utils/http";
import { describe, it, beforeAll } from "@jest/globals";
import {
  createPersonalVerifiedCustomer,
  createUnverifiedCustomer,
  getAppToken,
} from "../service/digital-banking/Dwolla";
import {
  DwollaUnverifiedCustomerRequest,
  DwollaEvent,
  DwollaPersonalVerifiedCustomerRequest,
} from "../service/digital-banking/DwollaTypes";
import {
  createSignature,
  validSignature,
} from "../service/digital-banking/DwollaUtils";
import faker from "faker";
import { INewUserResponse } from "../types";

const expect = chai.expect;
chai.use(chaiHttp);
const server = getApp();

const CUSTOMERS_TO_CREATE = 1;

describe("Dwolla test suite", () => {
  beforeAll(async () => {
    await setupContracts();
  });

  describe("Dwolla: test basic configuration and utilities", () => {
    it("it should create a signature for a dummy body and re-validate that signature", (done) => {
      const body: string = JSON.stringify({ dummy: "content" });
      const signature: string = createSignature(
        process.env.WEBHOOK_SECRET,
        body
      );
      log(`Test signature for body ${body} is ${signature}`);
      expect(signature).to.exist;
      const valid: boolean = validSignature(
        signature,
        process.env.WEBHOOK_SECRET,
        body
      );
      expect(valid).to.equal(true);
      done();
    });

    it("Should request and receive a valid Dwolla OAuth token", async () => {
      const appToken = await getAppToken();
      expect(appToken).to.exist;
    });
  });

  describe("Dwolla SDK test: creating customers and businesses", () => {
    it(`Should create ${CUSTOMERS_TO_CREATE} personal verified customer and return the entity link`, async () => {
      for (let i = 0; i < CUSTOMERS_TO_CREATE; i++) {
        const firstName = "Personal Verified " + faker.name.firstName();
        const lastName = faker.name.lastName();
        const address1 = faker.address.streetAddress();
        const address2 = faker.address.secondaryAddress();
        const city = faker.address.city();
        const postalCode = faker.address.zipCode();
        const state = faker.address.stateAbbr();
        const email = getSalt() + faker.internet.email();
        const dateOfBirth = "1970-01-01";
        const type = "personal";
        const ssn = faker.datatype.number(9999).toString();

        const person: DwollaPersonalVerifiedCustomerRequest = {
          firstName,
          lastName,
          email,
          type,
          address1,
          address2,
          city,
          state,
          postalCode,
          dateOfBirth,
          ssn,
        };
        const id = await createPersonalVerifiedCustomer(person);
        log("Verified customer created, link:" + id);
        expect(id).to.exist;
      }
    });

    it(`Should create ${CUSTOMERS_TO_CREATE} personal unverified customer and return the entity link`, async () => {
      for (let i = 0; i < CUSTOMERS_TO_CREATE; i++) {
        const firstName = "Personal Unverified " + faker.name.firstName();
        const lastName = faker.name.lastName();
        const email = getSalt() + faker.internet.email();
        const ipAddress = faker.internet.ip().toString();
        const correlationId = getSalt() + faker.random.alphaNumeric();

        const person: DwollaUnverifiedCustomerRequest = {
          firstName,
          lastName,
          email,
          ipAddress,
          correlationId,
        };
        const response = await createUnverifiedCustomer(person);
        log("Unverified customer created, link: " + response.resourceUri);
        expect(response).to.exist;
      }
    });

    it(`Should create ${CUSTOMERS_TO_CREATE} personal unverified customers as a business entity and return the entity link`, async () => {
      for (let i = 0; i < CUSTOMERS_TO_CREATE; i++) {
        const firstName =
          "Personal Unverified Business " + faker.name.firstName();
        const lastName = faker.name.lastName();
        const email = getSalt() + faker.internet.email();
        const ipAddress = faker.internet.ip().toString();
        const correlationId = getSalt() + faker.random.alphaNumeric();
        const businessName =
          "Personal Unverified Business " + faker.company.companyName();

        const person: DwollaUnverifiedCustomerRequest = {
          firstName,
          lastName,
          email,
          ipAddress,
          businessName,
          correlationId,
        };
        const response = await createUnverifiedCustomer(person);
        log(
          "Unverified business customer created, link: " + response.resourceUri
        );
        expect(response).to.exist;
      }
    });
  });

  describe("Server test: POST /webhook", () => {
    let user: INewUserResponse;

    it(`Should create a personal unverified customer and return the entity link for usage in this test suite`, async () => {
      const firstName = "Personal Unverified " + faker.name.firstName();
      const lastName = faker.name.lastName();
      const email = getSalt() + faker.internet.email();
      const ipAddress = faker.internet.ip().toString();
      const correlationId = getSalt() + faker.random.alphaNumeric();

      const person: DwollaUnverifiedCustomerRequest = {
        firstName,
        lastName,
        email,
        ipAddress,
        correlationId,
      };
      user = await createUnverifiedCustomer(person);
      log("Unverified customer created, id: " + user.userId);
      expect(user.userId).to.exist;
    });

    it("it should post a supported webhook event and successfully process it, HTTP 202", (done) => {
      const event: DwollaEvent = createDummyEvent(
        "customer_created",
        user.userId
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

    it("it should post an unknown webhook event, HTTP 500", (done) => {
      const event: DwollaEvent = createDummyEvent(
        "customer_bananas",
        user.userId
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
          expect(res).to.have.status(codes.SERVER_ERROR);
          log(JSON.parse(res.text));
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should post a known but unsupported webhook event, HTTP 422", (done) => {
      const event: DwollaEvent = createDummyEvent(
        "customer_suspended",
        user.userId
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
          expect(res).to.have.status(codes.UNPROCESSABLE);
          log(JSON.parse(res.text));
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });
});
