import express from "express";
import * as controller from "./controller";
import * as validators from "./validators";

const webhook = express();

webhook.post("/webhook", validators.dwollaWebhook, controller.dwollaWebhook);

export default webhook;
