import express from "express";
import * as controller from "./controller";
import * as validator from "./validators";

const admin = express();
admin.post("/admin/pause", controller.adminPause);
admin.post("/admin/unpause", controller.adminUnpause);
admin.post(
  "/admin/transfer/controller",
  validator.transferOwnerController,
  controller.transferControllerOwner
);
admin.post(
  "/admin/transfer/user",
  validator.transferOwnerUser,
  controller.transferWalletOwner
);

export default admin;
