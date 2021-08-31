import express from "express";
import { validationResult } from "express-validator";
import { httpUtils } from "src/utils";

export const mwVaildator = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(httpUtils.codes.BAD_REQUEST)
      .json({ errors: errors.array() });
  }

  next();
};
