import { describe } from "@jest/globals";
import * as AuthService from "src/service/AuthService";

const newCustomerData = {
	base: {
		email: "tech@hc.com",
		consent: true,
	},
	customer: {
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
}

const newBusinessData = {
	base: {
		email: "tech@hc.com",
		consent: true,
	},
	business: {
		avatar: "businessavatar",
		tag: "businesstag",
		address1: "businessaddress1",
		address2: "businessaddress2",
		city: "businesscity",
		state: "businessstate",
		postalCode: "businesspostalCode",
		dowllaId: "businessdowlladId",
		resourceUri: "businessresourceUri",
		story: "businessstory",
		type: "type",
		rbn: "rbn",
		industry: "indu",
		ein: "ein",
		phoneNumber: "pn",
		owner: {
		firstName: "businessfirstNameowner",
		lastName: "businesslastNameowner",
		address1: "businessaddress1owner",
		address2: "businessaddress2owner",
		city: "businesscityowner",
		state: "businessstateowner",
		postalCode: "businesspostalCodeowner",
		}
	}
}

describe("AuthService test suite", () => {
	describe('create new user', () => {
		it('Should create customer successfully', async () => {
			const response = await AuthService.createCustomer({ 
				customer: { ...newCustomerData.customer }, 
				...newCustomerData.base 
			});
			expect(response.success).toEqual(true)
			expect(response.data.verifiedBusiness).toEqual(false)
			expect(response.data.verifiedCustomer).toEqual(true)
			expect(response.data.email).toEqual(newCustomerData.base.email)
			expect(response.data.consent).toEqual(newCustomerData.base.consent)
			expect(response.data.customer.resourceUri).toEqual(newCustomerData.customer.resourceUri)
			expect(response.data.customer.dowllaId).toEqual(newCustomerData.customer.dowllaId)
			expect(response.data.customer.lastName).toEqual(newCustomerData.customer.lastName)
			expect(response.data.customer.firstName).toEqual(newCustomerData.customer.firstName)
			expect(response.data.customer.postalCode).toEqual(newCustomerData.customer.postalCode)
			expect(response.data.customer.state).toEqual(newCustomerData.customer.state)
			expect(response.data.customer.city).toEqual(newCustomerData.customer.city)
			expect(response.data.customer.address2).toEqual(newCustomerData.customer.address2)
			expect(response.data.customer.address1).toEqual(newCustomerData.customer.address1)
			expect(response.data.customer.tag).toEqual(newCustomerData.customer.tag)
			expect(response.data.customer.avatar).toEqual(newCustomerData.customer.avatar)
		})

		it('Should create business successfully', async () => {
			const response = await AuthService.createBusiness({
				business: { ...newBusinessData.business }, 
				...newCustomerData.base 
			});

			expect(response.success).toEqual(true)
			expect(response.data.verifiedBusiness).toEqual(true)
			expect(response.data.verifiedCustomer).toEqual(false)
			expect(response.data.consent).toEqual(newBusinessData.base.consent)
			expect(response.data.business.story).toEqual(newBusinessData.business.story)
			expect(response.data.business.tag).toEqual(newBusinessData.business.tag)
			expect(response.data.business.avatar).toEqual(newBusinessData.business.avatar)
			expect(response.data.business.type).toEqual(newBusinessData.business.type)
			expect(response.data.business.rbn).toEqual(newBusinessData.business.rbn)
			expect(response.data.business.industry).toEqual(newBusinessData.business.industry)
			expect(response.data.business.resourceUri).toEqual(newBusinessData.business.resourceUri)
			expect(response.data.business.dowllaId).toEqual(newBusinessData.business.dowllaId)
			expect(response.data.business.postalCode).toEqual(newBusinessData.business.postalCode)
			expect(response.data.business.state).toEqual(newBusinessData.business.state)
			expect(response.data.business.city).toEqual(newBusinessData.business.city)
			expect(response.data.business.address2).toEqual(newBusinessData.business.address2)
			expect(response.data.business.address1).toEqual(newBusinessData.business.address1)
			expect(response.data.business.owner.lastName).toEqual(newBusinessData.business.owner.lastName)
			expect(response.data.business.owner.firstName).toEqual(newBusinessData.business.owner.firstName)
			expect(response.data.business.owner.address1).toEqual(newBusinessData.business.owner.address1)
			expect(response.data.business.owner.address2).toEqual(newBusinessData.business.owner.address2)
			expect(response.data.business.owner.city).toEqual(newBusinessData.business.owner.city)
			expect(response.data.business.owner.state).toEqual(newBusinessData.business.owner.state)
			expect(response.data.business.owner.postalCode).toEqual(newBusinessData.business.owner.postalCode)
		})
	});

	describe('add additional verification to existing user', () => {
		it('adds business verification to an existing customer', async () => {
			const response = await AuthService.createCustomer({
				customer: { ...newCustomerData.customer },
				...newCustomerData.base
			});
			const customerVerification = await AuthService.addBusinessVerification(response.data.customer.dowllaId, { business: { ...newBusinessData.business, ...newBusinessData.base } })
			expect(customerVerification.data.customer).toEqual({ ...newCustomerData.customer })
			expect(customerVerification.data.business).toEqual({ ...newBusinessData.business })
			expect(customerVerification.data.verifiedBusiness).toEqual(true)
			expect(customerVerification.data.verifiedCustomer).toEqual(true)
			expect(customerVerification.data.consent).toEqual(true)
		})

		it('adds customer verification to an existing business', async () => {
			const response = await AuthService.createBusiness({
				business: { ...newBusinessData.business },
				...newCustomerData.base
			});
			const customerVerification = await AuthService.addCustomerVerification(response.data.business.dowllaId, { customer: { ...newCustomerData.customer, ...newCustomerData.base } })
			expect(customerVerification.data.customer).toEqual({ ...newCustomerData.customer })
			expect(customerVerification.data.business).toEqual({ ...newBusinessData.business })
			expect(customerVerification.data.verifiedBusiness).toEqual(true)
			expect(customerVerification.data.verifiedCustomer).toEqual(true)
			expect(customerVerification.data.consent).toEqual(true)
		})
	})
})