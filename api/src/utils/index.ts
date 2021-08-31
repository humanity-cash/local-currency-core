import * as cryptoUtils from "./crypto";
import * as httpUtils from "./http";

export { cryptoUtils, httpUtils };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function log(...data: any[]): void {
  if (process.env.DEBUG === "true") log(...data);
}
