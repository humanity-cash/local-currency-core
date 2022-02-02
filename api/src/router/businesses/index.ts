import express from "express";
import * as controller from "./controller";
import { verifyRequest } from "src/middlewares";

const businesses = express();

businesses.get("/businesses", verifyRequest, controller.getAllBusinesses);

export default businesses;
