import express, {Request, Response} from "express";
import morgan from "morgan";
import cors from "cors";
import * as PublicController from "./controllers/Public";
import * as AuthorizedController from "./controllers/Authorized";
import * as OwnerController from "./controllers/Owner";

import dotenv from "dotenv";
dotenv.config();

export const getApp = () : express => {

  const app = express();
 
  app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
  app.use(express.json({type: "application/json"}));
  app.use(cors());
  app.set("x-powered-by", false);
 
  app.get("/health", (req:Request, res:Response) => {PublicController.health(req,res)});
  app.get("/user", (req:Request, res:Response) => {PublicController.getUser(req,res)});
  app.get("/user/all", (req:Request, res:Response) => {PublicController.getAllUsers(req,res)});
  app.get("/authorize", (req:Request, res:Response) => {PublicController.getAuthorizations(req,res)});
  app.get("/settle", (req:Request, res:Response) => {PublicController.getSettlements(req,res)});
 
  app.post("/user", (req:Request, res:Response) => {AuthorizedController.createUser(req,res)});
  app.post("/authorize", (req:Request, res:Response) => {AuthorizedController.authorization(req,res)});
  app.delete("/authorize", (req:Request, res:Response) => {AuthorizedController.deleteAuthorization(req,res)});
  app.post("/settle", (req:Request, res:Response) => {AuthorizedController.settlement(req,res)});
  app.post("/reconcile", (req:Request, res:Response) => {OwnerController.reconciliation(req,res)});

  return app;
}