import faker from "faker";
import { newCustomerData } from "./utils";
import * as AuthService from "src/service/AuthService";

import moment from "moment";
import { TransferType } from "src/types";
import { corePeriodReport } from "../router/reports/controller";
import { mockDatabase } from "./setup/setup-db-integration";

const currentTime = moment().unix();

const tx = {
	fromUserId: 'fromUserId',
	fromAddress: 'fromAddress',
	toUserId: 'toUserId',
	toAddress: 'toAddress',
	value: '2',
	type: TransferType.IN,
	transactionHash: 'txhash',
	blockNumber: '2',
	timestamp: currentTime,
}

const txs = [tx, tx, tx];

jest.mock('../service/OperatorService', () => {
	const getTransfersForUser = jest.fn(() => txs);
	return { getTransfersForUser };
})

describe("Reports", () => {
	beforeAll(async () => {
		await mockDatabase.init();
	});

	afterAll(async (): Promise<void> => {
		await mockDatabase.stop();
	});

	it("Returns reports in period", async () => {
		/**user1 */
		const user1Id = "dwollaId";
		const user2Id = "dwollaId11";
		const user1 = await AuthService.createUser(
			{
				customer: newCustomerData(),
				email: faker.internet.email(),
				consent: true,
			},
			"customer"
		);
		await AuthService.updateDwollaDetails(
			user1.data.dbId
			, { dwollaId: user1Id, resourceUri: "resourceUri1" }
			, 'customer');
		await AuthService.updateWalletAddress({ walletAddress: "fromAddress", dwollaId: user1Id});
		/**user2 */
		const user2 = await AuthService.createUser(
			{
				customer: newCustomerData(),
				email: faker.internet.email(),
				consent: true,
			},
			"customer"
		);
		await AuthService.updateDwollaDetails(
			user2.data.dbId
			, { dwollaId: user2Id, resourceUri: "resourceUri11" }
			, 'customer');
		await AuthService.updateWalletAddress({ walletAddress: "toAddress", dwollaId: user2Id });
		const fromTime = currentTime - 3000;
		const toTime = currentTime + 5000;
		const report = await corePeriodReport({ userId: user1Id, fromTime, toTime });

		expect(report).toHaveLength(3);
	});

	it("Returns empty array", async () => {
		const userId = 'dwollaId1';
		const fromTime = currentTime + 1000;
		const toTime = currentTime + 4000;
		const report = await corePeriodReport({ userId, fromTime, toTime });
		expect(report).toHaveLength(0);
		expect(report).toEqual([]);
	});
});