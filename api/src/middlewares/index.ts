import express from "express";
import { validationResult } from "express-validator";

export const mwVaildator = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  next();
};
