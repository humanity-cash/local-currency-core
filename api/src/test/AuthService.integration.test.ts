import * as AuthService from "src/service/AuthService";

// const newCustomerData = {
// 	base: {
// 		email: "tech@hc.com",
// 		consent: true,
// 	},
// 	customer: {
// 		avatar: "customeravatar",
// 		tag: "customertag",
// 		address1: "customeraddress1",
// 		address2: "customeraddress2",
// 		city: "customercity",
// 		state: "customerstate",
// 		postalCode: "customerpostalCode",
// 		firstName: "customerfirstName",
// 		lastName: "customerlastName",
// 		dwollaId: "customerdowlladId",
// 		resourceUri: "customerresourceUri",
// 	}
// }

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
		dwollaId: "",
		resourceUri: "",
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
		it.only('Should create business successfully', async () => {
			const response = await AuthService.createUser({
				business: { ...newBusinessData.business },
				...newBusinessData.base
			}, 'business');

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
			expect(response.data.business.resourceUri).toEqual("")
			expect(response.data.business.dwollaId).toEqual(undefined)
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
	})
});