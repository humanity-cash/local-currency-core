import express from "express";
import * as controller from "./controller";

const businesses = express();

businesses.get("/businesses", controller.getAllBusinesses);

export default businesses;
