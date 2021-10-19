import { Request, Response } from "express";
import moment from "moment";
import { uploadMerchantReportToS3 } from "src/aws";
import * as OperatorService from "src/service/OperatorService";
import {
	ITransferEvent
} from "src/types";
import { httpUtils, log } from "src/utils";



/**
Sending transaction reports via mail for a given period.
The fields for the report: Date, Transaction Type, Customer, Amount
**/

enum TransactionType {
	IN = 'in',
	OUT = 'out'
}

const mockData: Report[] =
	[
		{
			amount: 2, customer: 'Customer Name',
			date: moment().unix(),
			transactionType: TransactionType.IN
		}
		, {
			amount: 2, customer: 'Customer Name',
			date: moment().unix(),
			transactionType: TransactionType.IN
		}
		, {
			amount: 2, customer: 'Customer Name',
			date: moment().unix(),
			transactionType: TransactionType.IN
		}
	]

export async function getUserTransactions(userId: string): Promise<Report[]> {
	log(userId);
	return mockData;
}

type UserId = string;

interface PeriodReportInput {
	userId: UserId 
	fromTime: number,
	toTime: number,
}

interface Report { 
	transactionType: TransactionType,
	amount: number,
	customer: UserId,
	date: number, // unix
};

// Returns a csv from an array of objects with
// values separated by tabs and rows separated by newlines
function CSV(array) {
	// Use first element to choose the keys and the order
	const keys = Object.keys(array[0]);

	// Build header
	let result = keys.join(",") + "\n";

	// Add the rows
	array.forEach(function (obj) {
		result += keys.map(k => obj[k]).join(",") + "\n";
	});

	return result;
}

function mapTxToReport(tx: ITransferEvent[]): Report[] {
	return tx?.map((t: ITransferEvent) => ({
		transactionType: TransactionType.IN,
		amount: Number(t.value),
		customer: t.fromUserId,
		date: Number(t.timestamp)
	}))
}

export async function corePeriodReport(i: PeriodReportInput): Promise<Report[]> {
	const { userId, fromTime, toTime } = i;
	const txs: ITransferEvent[] =
		await OperatorService.getTransfersForUser(userId);
	const txFilteredByTime: ITransferEvent[] = txs.filter((t: ITransferEvent) => t.timestamp > fromTime && t.timestamp < toTime)
	if (txFilteredByTime.length === 0) {
		return [];
	}
	const reports: Report[] = mapTxToReport(txFilteredByTime);
	const csv =  CSV(reports);
	await uploadMerchantReportToS3(`${userId}.csv`, csv);
	console.log("🚀 ~ file: controller.ts ~ line 69 ~ periodReport ~ csv", csv)

	return reports;
}

export async function periodReport(req: Request, res: Response): Promise<void> {
	try {
		const id = req?.params?.id;
		const { fromTime, toTime } = req?.body;
		const reports: Report[] = await corePeriodReport({userId: id, fromTime, toTime})
		log(id);
		httpUtils.createHttpResponse(reports, 200, res);
	} catch (err) {
		if (err.message && err.message.includes("ERR_USER_NOT_EXIST"))
			httpUtils.notFound("Get user failed: user does not exist", res);
		else {
			httpUtils.serverError(err, res);
		}
	}
}
