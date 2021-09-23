import express from "express";
import * as controller from "./controller";

const stats = express();

stats.get("/stats/deposit", controller.getAllDeposits);
stats.get("/stats/withdrawal", controller.getAllWithdrawals);
stats.get("/stats/operator", controller.getOperatorStatistics);
stats.get("/stats/transfer", controller.getAllTransfers);

export default stats;
