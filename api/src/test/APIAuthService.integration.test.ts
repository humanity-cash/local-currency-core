import chai from "chai";
import chaiHttp from "chai-http";
import { getApp } from "../server";
import { log } from "../utils";
import { codes } from "../utils/http";

const expect = chai.expect;
chai.use(chaiHttp);
const server = getApp();

describe("Auth Service API Test", () => {
	it("It should create customer", (done) => {
		chai
			.request(server)
			.post("/users")
			.send({
				consent: true,
				email: 'ee@hc.cc',
				type: 'customer',
				customer: {
					firstName: 'eheh',
					lastName: 'eheh',
					address1: 'eheh',
					address2: 'eheh',
					city: 'eheh',
					state: 'eheh',
					postalCode: 'eheh',
					avatar: 'eheh',
					tag: 'eheh',
					dwollaId: "dwollaId",
					resourceUri: 'eheh',
				}
			})
			.then((res) => {
				expect(res).to.have.status(codes.BAD_REQUEST);
				log(JSON.parse(res.text));
				done();
			})
			.catch((err) => {
				done(err);
			});
	});
});

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
// 		dowllaId: "customerdowlladId",
// 		resourceUri: "customerresourceUri",
// 	}
// }

// const newBusinessData = {
// 	base: {
// 		email: "tech@hc.com",
// 		consent: true,
// 	},
// 	business: {
// 		avatar: "businessavatar",
// 		tag: "businesstag",
// 		address1: "businessaddress1",
// 		address2: "businessaddress2",
// 		city: "businesscity",
// 		state: "businessstate",
// 		postalCode: "businesspostalCode",
// 		dowllaId: "businessdowlladId",
// 		resourceUri: "businessresourceUri",
// 		story: "businessstory",
// 		type: "type",
// 		rbn: "rbn",
// 		industry: "indu",
// 		ein: "ein",
// 		phoneNumber: "pn",
// 		owner: {
// 			firstName: "businessfirstNameowner",
// 			lastName: "businesslastNameowner",
// 			address1: "businessaddress1owner",
// 			address2: "businessaddress2owner",
// 			city: "businesscityowner",
// 			state: "businessstateowner",
// 			postalCode: "businesspostalCodeowner",
// 		}
// 	}
// }
