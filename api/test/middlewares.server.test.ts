import dotenv from "dotenv";
import chai from "chai";
import path from "path";
import chaiHttp from "chai-http";
import { getApp } from "../src/server";
import { log } from "./utils";
import { codes } from "../src/utils/http";
import * as sinon from 'sinon';
import * as aws from '../src/aws';

const expect = chai.expect;
chai.use(chaiHttp);
const server = getApp();

const result = dotenv.config({
	path: path.resolve(process.cwd(), ".env.test"),
});
if (result.error) {
	throw result.error;
}

let stub;
describe("Middlewares", () => {
	// beforeAll(async () => {
	// 	await setupContracts();
	// });

	afterEach(() => {
		sinon.restore()
	})

	describe("auth", () => {
		it("Incorrect token", (done) => {
		 	stub = sinon.stub(aws, 'verifyCognitoToken')
			console.log("🚀 ~ file: middlewares.server.test.ts ~ line 29 ~ it ~ stub", stub)
			chai
				.request(server)
				.get("/health")
				.set('authorization', 'tokeeeen')
				.then((res) => {
					expect(res).to.have.status(codes.UNAUTHORIZED);
					expect(JSON.parse(res.text)).to.eql({ err: "User is Unauthorized" })
					expect(stub.calledOnce).to.eql(true);
					log(JSON.parse(res.text));
					done();
				})
				.catch((err) => {
					throw err;
				});
		});
	});

	it("Token does not exist", (done) => {
		const stub = sinon.stub(aws, 'verifyCognitoToken')
		console.log("🚀 ~ file: middlewares.server.test.ts ~ line 29 ~ it ~ stub", stub)
		chai
			.request(server)
			.get("/health")
			.then((res) => {
				expect(res).to.have.status(codes.UNAUTHORIZED);
				expect(JSON.parse(res.text)).to.eql({ err: "No Auth Headers In Request" })
				expect(stub.calledOnce).to.eql(false);
				log(JSON.parse(res.text));
				done();
			})
			.catch((err) => {
				throw err;
			});
	});
});
