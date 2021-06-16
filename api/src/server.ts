import cors from "cors";
import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import morgan from "morgan";
import router from 'src/router';
import * as Controller from "src/controllers";

dotenv.config();

export const getApp = () : Express => {

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