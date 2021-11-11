import { Request, Response } from "express";
import { getUserData } from "src/service/AuthService";
import { uploadMerchantReportToS3 } from "src/aws";
import * as OperatorService from "src/service/OperatorService";
import { ITransferEvent, PeriodReportInput, Report } from "src/types";
import { csvUtils, httpUtils, log } from "src/utils";

async function mapTxToReport(tx: ITransferEvent[]): Promise<Report[]> {
  const result = await Promise.all(
    tx?.map(async function (t: ITransferEvent) {
      const fromUser = await getUserData(t.fromAddress);
      const toUser = await getUserData(t.toAddress);
      return {
        TransferType: t.type,
        amount: Number(t.value),
        from: fromUser.data.name,
        to: toUser.data.name,
        date: Number(t.timestamp),
      };
    })
  );
  return result;
}

export async function corePeriodReport(
  i: PeriodReportInput
): Promise<Report[]> {
  const { userId, fromTime, toTime } = i;
  const txs: ITransferEvent[] = await OperatorService.getTransfersForUser(
    userId
  );
  const txFilteredByTime: ITransferEvent[] = txs.filter((t: ITransferEvent) => {
    return t.timestamp > fromTime && t.timestamp < toTime;
  });
  if (txFilteredByTime.length === 0) {
    log("No report transfers found for user" + userId);
    return [];
  }
  const reports: Report[] = await mapTxToReport(txFilteredByTime);

  /**SKIP FOR NOW */
  const execute = false;
  if (execute) {
    const csv = csvUtils.convertArrayToCSV(reports);
    await uploadMerchantReportToS3(`${userId}.csv`, csv);
  }

  return reports;
}

export async function periodReport(req: Request, res: Response): Promise<void> {
  try {
    const id = req?.params?.id;
    const { fromTime, toTime } = req?.body;
    const reports: Report[] = await corePeriodReport({
      userId: id,
      fromTime,
      toTime,
    });
    httpUtils.createHttpResponse(reports, 200, res);
  } catch (err) {
    if (err.message && err.message.includes("ERR_USER_NOT_EXIST"))
      httpUtils.notFound("Get user failed: user does not exist", res);
    else {
      httpUtils.serverError(err, res);
    }
  }
}
