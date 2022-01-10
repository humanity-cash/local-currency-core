import express from "express";
import * as controller from "./controller";
import * as validator from "./validators";
import { verifyRequest } from "src/middlewares";

const admin = express();
admin.post("/admin/pause", verifyRequest, controller.adminPause);
admin.post("/admin/unpause", verifyRequest, controller.adminUnpause);
admin.post(
  "/admin/transfer/controller",
  verifyRequest,
  validator.transferOwnerController,
  controller.transferControllerOwner
);
admin.post(
  "/admin/transfer/user",
  verifyRequest,
  validator.transferOwnerUser,
  controller.transferWalletOwner
);

export default admin;
