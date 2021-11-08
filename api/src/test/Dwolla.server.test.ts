import { afterAll, beforeAll, beforeEach, describe, it } from "@jest/globals";
import chai from "chai";
import chaiHttp from "chai-http";
import faker from "faker";
import {
  deregisterWebhook,
  getAllWebhooks,
  registerWebhook
} from "src/service/digital-banking/DwollaWebhookService";
import { getApp } from "../server";
import {
  createPersonalVerifiedCustomer,
  createUnverifiedCustomer,
  getFundingSourcesById
} from "../service/digital-banking/DwollaService";
import {
  DwollaEvent,
  DwollaPersonalVerifiedCustomerRequest, DwollaUnverifiedCustomerRequest
} from "../service/digital-banking/DwollaTypes";
import {
  createSignature, getAppToken, validSignature
} from "../service/digital-banking/DwollaUtils";
import { IDwollaNewUserResponse } from "../types";
import { httpUtils, log } from "../utils";
import { codes } from "../utils/http";
import { mockDatabase } from "./setup/setup-db-integration";
import { createDummyEvent, getSalt, setupContracts } from "./utils";

const expect = chai.expect;
chai.use(chaiHttp);
const server = getApp();

const CUSTOMERS_TO_CREATE = 1;

describe("Dwolla test suite", () => {
  beforeAll(async () => {
    await mockDatabase.init();
    await setupContracts();
  });

  afterAll(async (): Promise<void> => {
    await mockDatabase.stop();
  });

  describe("Dwolla: test basic configuration and utilities", () => {
    let webhookUrl;

    beforeEach(async (): Promise<void> => {
      if (mockDatabase.isConnectionOpen()) return;
      await mockDatabase.openNewMongooseConnection();
    });

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

    it("Should request and receive a valid Dwolla OAuth token", async (): Promise<void> => {
      const appToken = await getAppToken();
      expect(appToken).to.exist;
    });

    xit("Should register a webhook", async (): Promise<void> => {
      webhookUrl = await registerWebhook();
      expect(webhookUrl).to.exist;
      log(webhookUrl);
    });

    it("Should list all webhooks", async (): Promise<void> => {
      const webhooks = await getAllWebhooks();
      log(JSON.stringify(webhooks.body, null, 2));
      expect(webhooks).to.exist;
    });

    xit("Should deregister a webhook", async (): Promise<void> => {
      const response = await deregisterWebhook(webhookUrl);
      expect(response).to.exist;
      expect(response.status).to.equal(httpUtils.codes.OK);
    });
  });

  describe("Dwolla SDK test: creating customers and businesses", () => {
    beforeEach(async (): Promise<void> => {
      if (mockDatabase.isConnectionOpen()) return;
      await mockDatabase.openNewMongooseConnection();
    });

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

    it(`Should retreive funding sources for a known account with an attached funding source (460852fc-c986-4d2d-aedb-e71d9e5aad37)`, async () => {
      const fundingSources = await getFundingSourcesById(
        "460852fc-c986-4d2d-aedb-e71d9e5aad37"
      );
      log(
        "Funding sources retrieved" + JSON.stringify(fundingSources, null, 2)
      );
      expect(fundingSources).to.exist;
    });
  });

  describe("Server test: POST /webhook", () => {
    beforeEach(async (): Promise<void> => {
      if (mockDatabase.isConnectionOpen()) return;
      await mockDatabase.openNewMongooseConnection();
    });

    let user: IDwollaNewUserResponse;
    let event1: DwollaEvent;

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
      event1 = createDummyEvent("customer_created", user.userId, user.userId);

      const signature = createSignature(
        process.env.WEBHOOK_SECRET,
        JSON.stringify(event1)
      );
      chai
        .request(server)
        .post("/webhook")
        .set({ "X-Request-Signature-SHA-256": signature })
        .send(event1)
        .then((res) => {
          expect(res).to.have.status(codes.ACCEPTED);
          log(JSON.parse(res.text));
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should accept (but not process) a duplicate webhook event, HTTP 202", (done) => {
      const signature = createSignature(
        process.env.WEBHOOK_SECRET,
        JSON.stringify(event1)
      );
      chai
        .request(server)
        .post("/webhook")
        .set({ "X-Request-Signature-SHA-256": signature })
        .send(event1)
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
      const event2: DwollaEvent = createDummyEvent(
        "customer_bananas",
        user.userId,
        user.userId
      );
      const signature = createSignature(
        process.env.WEBHOOK_SECRET,
        JSON.stringify(event2)
      );
      chai
        .request(server)
        .post("/webhook")
        .set({ "X-Request-Signature-SHA-256": signature })
        .send(event2)
        .then((res) => {
          expect(res).to.have.status(codes.SERVER_ERROR);
          log(JSON.parse(res.text));
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });
});
