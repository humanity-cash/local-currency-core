import faker from "faker";
import * as AuthService from "src/service/AuthService";
import { mockDatabase } from "./setup/setup-db-integration";
import { newBusinessData, newCustomerData } from "./utils";

const customerData = {
  base: {
    email: faker.internet.email(),
    consent: true,
  },
  customer: newCustomerData(),
};

const businessData = {
  base: {
    email: faker.internet.email(),
    consent: true,
  },
  business: newBusinessData(),
};

describe("AuthService test suite", () => {
  describe("create new user", () => {
    beforeAll(async () => {
      await mockDatabase.init();
    });

    afterAll(async (): Promise<void> => {
      await mockDatabase.stop();
    });
    it("Should create business successfully", async () => {
      const response = await AuthService.createUser(
        {
          business: { ...businessData.business },
          ...businessData.base,
        },
        "business"
      );

      expect(response.success).toEqual(true);
      expect(response.data.verifiedBusiness).toEqual(true);
      expect(response.data.verifiedCustomer).toEqual(false);
      expect(response.data.consent).toEqual(businessData.base.consent);
      expect(response.data.business.story).toEqual(businessData.business.story);
      expect(response.data.business.tag).toEqual(businessData.business.tag);
      expect(response.data.business.avatar).toEqual(
        businessData.business.avatar
      );
      expect(response.data.business.type).toEqual(businessData.business.type);
      expect(response.data.business.rbn).toEqual(businessData.business.rbn);
      expect(response.data.business.industry).toEqual(
        businessData.business.industry
      );
      expect(response.data.business.resourceUri).toEqual(undefined);
      expect(response.data.business.dwollaId).toEqual(undefined);
      expect(response.data.business.postalCode).toEqual(
        businessData.business.postalCode
      );
      expect(response.data.business.state).toEqual(businessData.business.state);
      expect(response.data.business.city).toEqual(businessData.business.city);
      expect(response.data.business.address2).toEqual(
        businessData.business.address2
      );
      expect(response.data.business.address1).toEqual(
        businessData.business.address1
      );
      expect(response.data.business.owner.lastName).toEqual(
        businessData.business.owner.lastName
      );
      expect(response.data.business.owner.firstName).toEqual(
        businessData.business.owner.firstName
      );
      expect(response.data.business.owner.address1).toEqual(
        businessData.business.owner.address1
      );
      expect(response.data.business.owner.address2).toEqual(
        businessData.business.owner.address2
      );
      expect(response.data.business.owner.city).toEqual(
        businessData.business.owner.city
      );
      expect(response.data.business.owner.state).toEqual(
        businessData.business.owner.state
      );
      expect(response.data.business.owner.postalCode).toEqual(
        businessData.business.owner.postalCode
      );
    });

    it("Should create customer successfully", async () => {
      const response = await AuthService.createUser(
        {
          customer: { ...customerData.customer },
          ...customerData.base,
        },
        "customer"
      );

      expect(response.success).toEqual(true);
      expect(response.data.verifiedBusiness).toEqual(false);
      expect(response.data.verifiedCustomer).toEqual(true);
      expect(response.data.consent).toEqual(customerData.base.consent);
      expect(response.data.customer.lastName).toEqual(
        customerData.customer.lastName
      );
      expect(response.data.customer.firstName).toEqual(
        customerData.customer.firstName
      );
      expect(response.data.customer.address1).toEqual(
        customerData.customer.address1
      );
      expect(response.data.customer.address2).toEqual(
        customerData.customer.address2
      );
      expect(response.data.customer.city).toEqual(customerData.customer.city);
      expect(response.data.customer.state).toEqual(customerData.customer.state);
      expect(response.data.customer.postalCode).toEqual(
        customerData.customer.postalCode
      );
    });
  });
});
