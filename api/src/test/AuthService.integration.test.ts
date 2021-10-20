import { describe } from "@jest/globals";
import { get } from "src/database/service/User";
import * as AuthService from "src/service/AuthService";

	const customerData = {
		avatar: "customeravatar",
		tag: "customertag",
		address1: "customeraddress1",
		address2: "customeraddress2",
		city: "customercity",
		state: "customerstate",
		postalCode: "customerpostalCode",
		firstName: "customerfirstName",
		lastName: "customerlastName",
		dowllaId: "customerdowlladId",
		resourceUri: "customerresourceUri",
	}

	const businessData = {
		story: "something",
		tag: "something",
		avatar: "something",
		type: "something",
		rbn: "something",
		industry: "something",
		ein: "something",
		address1: "something",
		address2: "something",
		city: "something",
		state: "something",
		postalCode: "something",
		phoneNumber: "something",
		dowllaId: "businessdowllaId",
		resourceUri: "something",
		owner: {
			firstName: "something",
			lastName: "something",
			address1: "something",
			address2: "something",
			city: "something",
			state: "something",
			postalCode:"something" 
		}
	}


describe("User test suite", () => {

	it('Should create user successfully', async () => {
		const email = "tech@hc.com";
		const response = await AuthService.createUser({ consent: true, email });
		expect(response.email).toEqual(email)
		expect(response.consent).toEqual(true)
	})

	it('Should verify customer', async () => {
		const email = "tech@hc.com";
		await AuthService.createUser({ consent: true, email });
		const updated = await AuthService.verifyCustomer({ email, customer: customerData });
		expect(updated).toBeDefined();

		const getResponse = await get(email);
		expect(getResponse.verifiedCustomer).toEqual(true)
	})

	it('Should verify business', async () => {
		const email = "tech1@hc.com";
		await AuthService.createUser({ consent: true, email });
		const updated = await AuthService.verifyBusiness({ email, business: businessData });
		expect(updated).toBeDefined();

		const getResponse = await get(email);
		expect(getResponse.verifiedBusiness).toEqual(true)
	})
});
