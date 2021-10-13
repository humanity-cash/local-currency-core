import * as cryptoUtils from "./crypto";
import * as httpUtils from "./http";
// import { LogService } from "src/database/service";

export { cryptoUtils, httpUtils };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function log(...data: any[]): void {
  if (process.env.DEBUG == "true") console.log(...data);
  // const logItem : LogService.ICreateLogDBItem = {
  //   timestamp: Date.now(),
  //   message: data.join(" ")
  // }
  // LogService.create(logItem)
  // .then(res => {
  //   if (process.env.DEBUG == "true")
  //     console.log("log() LogService: Log item created with dbId " + JSON.stringify(res, null, 2))
  // });
}

export function isDevelopment(): boolean {
  return process.env.NODE_ENV == "development";
}

export function isProduction(): boolean {
  return process.env.NODE_ENV == "production";
}
