import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express, { Express, Request, Response } from "express";
import morgan from "morgan";
import "./aliases";
import router from './router';
import * as Controller from "./controllers";

export const setupServer = () : Express => {
  const app = express();
 
  app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
  app.use(express.json({type: "application/json"}));
  app.use(cors());
  app.set("x-powered-by", false);
  app.use(router);
  app.get("/health", (req:Request, res:Response) => {Controller.health(req, res)});
  app.post("/reconcile", (req:Request, res:Response) => {Controller.reconciliation(req,res)});

  return app;
};

const runServer = () => {
	const PORT = process.env.PORT || 3000;
	const app = setupServer();
	app.listen(PORT, () => {
		console.log(
			"NODE_ENV:",
			process.env.NODE_ENV,
			"\nCELO_UBI_ADDRESS:",
			process.env.CELO_UBI_ADDRESS,
			"\nCELO_UBI_RPC_HOST:",
			process.env.CELO_UBI_RPC_HOST,
			"\nCELO_UBI_MNEMONIC set:",
			!!process.env.CELO_UBI_MNEMONIC
		);
		console.log(`App listening at http://localhost:${PORT}`);
	});
}

runServer();
