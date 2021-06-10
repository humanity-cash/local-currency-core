import dotenv from "dotenv";
import express, {Request, Response} from "express";
import morgan from "morgan";
import cors from "cors";

dotenv.config();

export const getApp = () : express => {
  const app = express();
  
  app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
  app.use(express.json({type: "application/json"}));
  app.use(cors());
  app.set("x-powered-by", false);
  
  app.get("/health", (req:Request, res:Response) => res.status(200).send());

  return app;
}