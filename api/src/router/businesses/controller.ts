import { Request, Response } from "express";
import { getBusinesses } from "src/database/service/User";
import { httpUtils } from "src/utils";
import { Business } from "src/types";

const codes = httpUtils.codes;

export async function getAllBusinesses(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const businesses: Business[] = await getBusinesses();
    httpUtils.createHttpResponse(businesses, codes.OK, res);
  } catch (err) {
    httpUtils.serverError(err, res);
  }
}
