import { describe } from "@jest/globals";
import { create, get, update } from "src/database/service/User";


describe("User test suite", () => {
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

	it('Should create user successfully', async () => {
		const email = "tech@hc.com";
		const response = await create({ consent: true, email });
		expect(response.email).toEqual(email)
		expect(response.consent).toEqual(true)
	})

	it('Should update user customer data successfully', async () => {
		const email = "tech@hc.com";
		const response = await create({ consent: true, email });
		expect(response.email).toEqual(email)
		expect(response.consent).toEqual(true)

		const updated = await update(email, { customer: customerData });
    console.log("🚀 ~ file: User.integration.test.ts ~ line 34 ~ it ~ updated", updated)
		expect(updated).toBeDefined();

		const getResponse = await get(email);
		expect(getResponse.customer.dowllaId).toEqual('customerdowlladId')
	})
});
