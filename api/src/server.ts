import cors from "cors";
import express, { Express } from "express";
import morgan from "morgan";
import router from "./router";

export function getApp(): Express {
  const app = express();
  app.use(
    morgan(":method :url :status :res[content-length] - :response-time ms")
  );
  app.use(express.json({ type: "application/json", limit: "50mb" }));
  app.use(express.urlencoded({limit: "50mb", extended: true}));
  app.use(cors());
  app.set("x-powered-by", false);
  app.use(router);

  return app;
}
