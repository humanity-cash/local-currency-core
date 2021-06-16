import { Request, Response } from "express";
import * as Owner from "src/service/OwnerService";
import * as PublicServices from "src/service/PublicService";
import { httpUtils } from "src/utils";

import codes = httpUtils.codes;

export async function health(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const response = await PublicServices.health();
    httpUtils.createHttpResponse(response, codes.OK, res);
  } catch (err) {
    console.error(err);
    httpUtils.createHttpResponse({ message: "Server error: " + err }, 500, res);
  }
}
export async function reconciliation(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const response = await Owner.reconcile();
    console.log(response);
    res.status(codes.ACCEPTED).end();
  } catch (err) {
    console.error(err);
    httpUtils.createHttpResponse(
      {
        message: "Server error: " + err,
      },
      codes.SERVER_ERROR,
      res
    );
  }
}
