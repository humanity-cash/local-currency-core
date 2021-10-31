import { AppNotificationService } from "src/database/service";
import * as cryptoUtils from "./crypto";
import * as httpUtils from "./http";
// import { LogService } from "src/database/service";

export { cryptoUtils, httpUtils };

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
export async function userNotification(
  userId: string,
  message: string,
  level = "INFO"
): Promise<boolean> {
  const notification: AppNotificationService.ICreateAppNotificationDBItem = {
    userId: userId,
    timestamp: Date.now(),
    message: message,
    level: level,
  };
  const result = await AppNotificationService.create(notification);
  log(
    `utils.ts::userNotification() Notification for ${userId} created with contents: ${JSON.stringify(
      result,
      null,
      2
    )}`
  );
  return true;
}

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

export function isTest(): boolean {
  return process.env.NODE_ENV == "test";
}

function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
};

export function isEmptyObject(i: unknown): boolean {
  if (!i || !isObject(i)) return true
  const keys = Object.keys(i);

  return Boolean(keys.length);
}
