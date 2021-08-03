/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Response } from "express";

export function createHttpResponse(
  data: any,
  code: number,
  response: Response
): void {
  const payload = JSON.stringify(data, null, 2);
  response.writeHead(code, {
    "Content-Type": "application/json",
  });
  if (code !== 200) {
    console.log(code, payload);
  }
  response.end(payload);
}

export const codes = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  ACCEPTED: 202,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
};
