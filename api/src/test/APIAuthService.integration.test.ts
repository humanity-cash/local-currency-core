import chai from "chai";
import chaiHttp from "chai-http";
import { getApp } from "../server";
import { log } from "../utils";
import { mockDatabase } from "./setup/setup-db-integration";
import { createFakeUser, newBusinessData, newCustomerData } from "./utils";

const expect = chai.expect;
chai.use(chaiHttp);
const server = getApp();

describe("Auth Service API Test", () => {
	let customerDwollaId;
	let businessDwollaId;

	beforeAll(async () => {
		await mockDatabase.init();
	});

	afterAll(async (): Promise<void> => {
		await mockDatabase.stop();
	});

	it("It should create customer", (done) => {
		chai
			.request(server)
			.post("/users")
			.send(createFakeUser())
			.then((res) => {
				expect(res.body.customer.dwollaId).to.exist;
				expect(res.body.customer.resourceUri).to.exist;
				expect(res.body.dbId).to.exist;
				expect(res.body.verifiedCustomer).to.eql(true);
				expect(res.body.verifiedBusiness).to.eql(false);
				expect(res).to.have.status(201);
				customerDwollaId = res.body.customer.dwollaId;
				log(JSON.parse(res.text));
				done();
			})
			.catch((err) => {
				done(err);
			});
	});
	it('adds business to existing customer', (done) => {
		chai
			.request(server)
			.post(`/users/${customerDwollaId}/business`)
			.send({
				business: newBusinessData,
			})
			.then((res) => {
				expect(res).to.have.status(201);
				expect(res.body.data.customer.dwollaId).to.exist;
				expect(res.body.data.customer.resourceUri).to.exist;
				expect(res.body.data.business.dwollaId).to.exist;
				expect(res.body.data.business.resourceUri).to.exist;
				expect(res.body.data.dbId).to.exist;
				expect(res.body.data.verifiedCustomer).to.eql(true);
				expect(res.body.data.verifiedBusiness).to.eql(true);
				log(JSON.parse(res.text));
				done();
			})
			.catch((err) => {
				done(err);
			});
	})


	it("It should create new business", (done) => {
		chai
			.request(server)
			.post("/users")
			.send(createFakeUser(true))
			.then((res) => {
				expect(res.body.business.dwollaId).to.exist;
				expect(res.body.business.resourceUri).to.exist;
				expect(res.body.dbId).to.exist;
				expect(res.body.verifiedCustomer).to.eql(false);
				expect(res.body.verifiedBusiness).to.eql(true);
				expect(res).to.have.status(201);
				businessDwollaId = res.body.business.dwollaId;
				log(JSON.parse(res.text));
				done();
			})
			.catch((err) => {
				done(err);
			});
	});

	it('adds customer to existing business', (done) => {
		chai
			.request(server)
			.post(`/users/${businessDwollaId}/customer`)
			.send({
				customer: newCustomerData,
			})
			.then((res) => {
				expect(res).to.have.status(201);
				expect(res.body.data.customer.dwollaId).to.exist;
				expect(res.body.data.customer.resourceUri).to.exist;
				expect(res.body.data.business.dwollaId).to.exist;
				expect(res.body.data.business.resourceUri).to.exist;
				expect(res.body.data.dbId).to.exist;
				expect(res.body.data.verifiedCustomer).to.eql(true);
				expect(res.body.data.verifiedBusiness).to.eql(true);
				log(JSON.parse(res.text));
				done();
			})
			.catch((err) => {
				done(err);
			});
	})
});