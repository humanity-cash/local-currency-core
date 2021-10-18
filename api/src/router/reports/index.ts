import express from "express";
import * as controller from "./controller";

const reports = express();

// Get and create user(s)
reports.get("/report/:from/:to", controller.periodReport);

export default reports;
