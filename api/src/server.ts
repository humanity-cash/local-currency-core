import cors from "cors";
import express, { Express, Request, Response } from "express";
import morgan from "morgan";
import router from "./router";
import * as Controller from "./controllers";

export const getApp = (): Express => {
  const app = express();

  app.use(
    morgan(":method :url :status :res[content-length] - :response-time ms")
  );
  app.use(express.json({ type: "application/json" }));
  app.use(cors());
  app.set("x-powered-by", false);
  app.use(router);
  app.get("/health", (req: Request, res: Response) => {
    Controller.health(req, res);
  });

  return app;
};
