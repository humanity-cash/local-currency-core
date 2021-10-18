import dotenv from "dotenv";
import moment from "moment";
import path from "path";
import { listBuckets } from "src/aws";
import { corePeriodReport } from "src/router/reports/controller";


const result = dotenv.config({
	path: path.resolve(process.cwd(), ".env.test"),
});

if (result.error) {
	throw result.error;
}
describe("Reports", () => {
	it("test 1", async () => {
		const userId = "userId";
		const fromTime = moment().unix() - 1000;
		const toTime = moment().unix() + 4000;
		const report = await corePeriodReport({ userId, fromTime, toTime });
		// await createBucket("merchants-tx-reports");
		await listBuckets()

		expect(report).toHaveLength(3);
	});
	it.skip("test 2", async () => {
		const userId = 'userId';
		const fromTime = moment().unix() + 1000;
		const toTime = moment().unix() + 4000;
		const report = await corePeriodReport({ userId, fromTime, toTime });
		expect(report).toHaveLength(0);
		expect(report).toEqual([]);
	});
});
