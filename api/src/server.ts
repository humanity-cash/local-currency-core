import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import morgan from "morgan";
import * as Controller from "./controllers";
import router from './router';

dotenv.config();

export const getApp = () : express => {

  const app = express();
 
  app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
  app.use(express.json({type: "application/json"}));
  app.use(cors());
  app.set("x-powered-by", false);
  app.use(router);
  app.get("/health", (req:Request, res:Response) => {Controller.health(req, res)});
  app.post("/reconcile", (req:Request, res:Response) => {Controller.reconciliation(req,res)});

  return app;
}