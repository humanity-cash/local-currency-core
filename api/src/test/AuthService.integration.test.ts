import { describe } from "@jest/globals";
import * as AuthService from "src/service/AuthService";

describe("AuthService test suite", () => {
	describe('create new user', () => {
		it('Should create customer successfully', async () => {
			const email = "tech@hc.com";
			const avatar = "customeravatar";
			const tag = "customertag";
			const address1 = "customeraddress1";
			const address2 = "customeraddress2";
			const city = "customercity";
			const state = "customerstate";
			const postalCode = "customerpostalCode";
			const firstName = "customerfirstName";
			const lastName = "customerlastName";
			const dowllaId = "customerdowlladId";
			const resourceUri = "customerresourceUri";
			const consent = true;

			const input = {
				email,
				customer: {
					avatar,
					tag,
					address1,
					address2,
					city,
					state,
					postalCode,
					firstName,
					lastName,
					dowllaId,
					resourceUri,
				},
				consent: true,
			}
			const response = await AuthService.createCustomer(input);
			expect(response.success).toEqual(true)
			expect(response.data.consent).toEqual(consent)
			expect(response.data.verifiedBusiness).toEqual(false)
			expect(response.data.verifiedCustomer).toEqual(true)
			expect(response.data.customer.resourceUri).toEqual(resourceUri)
			expect(response.data.customer.dowllaId).toEqual(dowllaId)
			expect(response.data.customer.lastName).toEqual(lastName)
			expect(response.data.customer.firstName).toEqual(firstName)
			expect(response.data.customer.postalCode).toEqual(postalCode)
			expect(response.data.customer.state).toEqual(state)
			expect(response.data.customer.city).toEqual(city)
			expect(response.data.customer.address2).toEqual(address2)
			expect(response.data.customer.address1).toEqual(address1)
			expect(response.data.customer.tag).toEqual(tag)
			expect(response.data.customer.avatar).toEqual(avatar)
		})

		it('Should create business successfully', async () => {
			const email = "tech@hc.com";
			const avatar = "businessavatar";
			const tag = "businesstag";
			const address1 = "businessaddress1";
			const address2 = "businessaddress2";
			const city = "businesscity";
			const state = "businessstate";
			const postalCode = "businesspostalCode";
			const firstName = "businessfirstName";
			const lastName = "businesslastName";
			const dowllaId = "businessdowlladId";
			const resourceUri = "businessresourceUri";
			const story = "businessstory";
			const consent = true;
			const type = "type";
			const rbn = "rbn";
			const industry = "indu";
			const ein = "ein";
			const phoneNumber = "pn"

			const input = {
				email,
				business: {
					story,
					tag,
					avatar,
					type,
					rbn,
					industry,
					ein,
					address1,
					address2,
					city,
					state,
					postalCode,
					phoneNumber,
					dowllaId,
					resourceUri,
					owner: {
						firstName,
						lastName,
						address1,
						address2,
						city,
						state,
						postalCode,
					}
				},
				consent: true,
			}
			const response = await AuthService.createBusiness(input);

			expect(response.success).toEqual(true)
			expect(response.data.consent).toEqual(consent)
			expect(response.data.verifiedBusiness).toEqual(true)
			expect(response.data.verifiedCustomer).toEqual(false)
			expect(response.data.business.story).toEqual(story)
			expect(response.data.business.tag).toEqual(tag)
			expect(response.data.business.avatar).toEqual(avatar)
			expect(response.data.business.type).toEqual(type)
			expect(response.data.business.rbn).toEqual(rbn)
			expect(response.data.business.industry).toEqual(industry)
			expect(response.data.business.resourceUri).toEqual(resourceUri)
			expect(response.data.business.dowllaId).toEqual(dowllaId)
			expect(response.data.business.postalCode).toEqual(postalCode)
			expect(response.data.business.state).toEqual(state)
			expect(response.data.business.city).toEqual(city)
			expect(response.data.business.address2).toEqual(address2)
			expect(response.data.business.address1).toEqual(address1)
			expect(response.data.business.owner.lastName).toEqual(lastName)
			expect(response.data.business.owner.firstName).toEqual(firstName)
			expect(response.data.business.owner.address1).toEqual(address1)
			expect(response.data.business.owner.address2).toEqual(address2)
			expect(response.data.business.owner.city).toEqual(city)
			expect(response.data.business.owner.state).toEqual(state)
			expect(response.data.business.owner.postalCode).toEqual(postalCode)
		})
	});

})