import * as utils from "../utils/utils";
import * as Owner from "../service/OwnerService";
import { Request, Response, NextFunction } from "express";

import codes = utils.codes;

export async function reconciliation(
  req: Request,
  res: Response,
  next?: NextFunction
): Promise<void> {
  try {
    const response = await Owner.reconcile();
    console.log(response);
    res.status(codes.ACCEPTED).end();
  } catch (err) {
    console.error(err);
    utils.createHttpResponse(
      {
        message: "Server error: " + err,
      },
      codes.SERVER_ERROR,
      res
    );
  }
}
