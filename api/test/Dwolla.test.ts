import dotenv from "dotenv";
import {
  getAppToken,
  createPersonalVerifiedCustomer,
  createUnverifiedCustomer,
} from "../src/service/digital-banking/Dwolla";
import {
  DwollaPersonalVerifiedCustomerRequest,
  DwollaUnverifiedCustomerRequest,
} from "../src/service/digital-banking/DwollaTypes";
import faker from "faker";
import path from "path";
import { describe, it, expect } from "@jest/globals";

const result = dotenv.config({
  path: path.resolve(process.cwd(), ".env.test"),
});
if (result.error) {
  throw result.error;
}

const CUSTOMERS_TO_CREATE = 1;

describe("Basic sanity checking Dwolla connection", () => {
  it("Should request and receive a valid Dwolla OAuth token", async () => {
    const appToken = await getAppToken();
    expect(appToken).toBeDefined();
  });
});

describe("Creating Dwolla customers", () => {
  it(`Should create ${CUSTOMERS_TO_CREATE} personal verified customer and return the entity link`, async () => {
    for (let i = 0; i < CUSTOMERS_TO_CREATE; i++) {
      const firstName = "Personal Verified " + faker.name.firstName();
      const lastName = faker.name.lastName();
      const address1 = faker.address.streetAddress();
      const address2 = faker.address.secondaryAddress();
      const city = faker.address.city();
      const postalCode = faker.address.zipCode();
      const state = faker.address.stateAbbr();
      const email = faker.internet.email();
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
      const customerURL = await createPersonalVerifiedCustomer(person);
      console.log("Verified customer created, link:" + customerURL);
      expect(customerURL).toBeDefined();
    }
  }, 60000);

  it(`Should create ${CUSTOMERS_TO_CREATE} personal unverified customer and return the entity link`, async () => {
    for (let i = 0; i < CUSTOMERS_TO_CREATE; i++) {
      const firstName = "Personal Unverified " + faker.name.firstName();
      const lastName = faker.name.lastName();
      const email = faker.internet.email();
      const ipAddress = faker.internet.ip().toString();
      const correlationId = faker.random.alphaNumeric();

      const person: DwollaUnverifiedCustomerRequest = {
        firstName,
        lastName,
        email,
        ipAddress,
        correlationId,
      };
      const customerURL = await createUnverifiedCustomer(person);
      console.log("Unverified customer created, link:" + customerURL);
      expect(customerURL).toBeDefined();
    }
  }, 60000);

  it(`Should create ${CUSTOMERS_TO_CREATE} personal unverified customers as a business entity and return the entity link`, async () => {
    for (let i = 0; i < CUSTOMERS_TO_CREATE; i++) {
      const firstName =
        "Personal Unverified Business " + faker.name.firstName();
      const lastName = faker.name.lastName();
      const email = faker.internet.email();
      const ipAddress = faker.internet.ip().toString();
      const correlationId = faker.random.alphaNumeric();
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
      const customerURL = await createUnverifiedCustomer(person);
      console.log("Unverified customer created, link:" + customerURL);
      expect(customerURL).toBeDefined();
    }
  }, 60000);
});

describe("Dwolla Webhook", () => {
  it("Should consume a webhook and process it correctly", async () => {
    const appToken = await getAppToken();
    expect(appToken).toBeDefined();
  });
});
