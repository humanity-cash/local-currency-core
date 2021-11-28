import express from "express";
import * as controller from "./controller";
import * as validators from "./validators";

const reports = express();

reports.post(
  "/report/:userId",
  validators.reportPeriod,
  controller.periodReport
);

export default reports;
