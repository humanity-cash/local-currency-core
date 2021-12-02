import express from "express";
import * as controller from "./controller";

const health = express();

health.get("/health", controller.health);

export default health;
