import express from "express";
import * as controller from "./controller";

const content = express();
content.get("/content", controller.getContent);
export default content;
