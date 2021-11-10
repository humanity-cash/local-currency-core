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

export function shouldRegisterWebhook(): boolean {
  return (
    process.env.REGISTER_WEBHOOK == "true" ||
    process.env.REGISTER_WEBHOOK == "TRUE"
  );
}
export function shouldSimulateWebhook(): boolean {
  return (
    process.env.SIMULATE_WEBHOOK == "true" ||
    process.env.SIMULATE_WEBHOOK == "TRUE"
  );
}
export function shouldSimulateBanking(): boolean {
  return (
    process.env.SIMULATE_WEBHOOK == "true" ||
    process.env.SIMULATE_WEBHOOK == "TRUE"
  );
}
export function isDwollaProduction(): boolean {
  return (
    process.env.DWOLLA_ENVIRONMENT == "production" ||
    process.env.DWOLLA_ENVIRONMENT == "PRODUCTION"
  );
}
export function shouldUseManagedSecrets(): boolean {
  return (
    process.env.USE_MANAGED_SECRETS == "true" ||
    process.env.USE_MANAGED_SECRETS == "TRUE"
  );
}

export function logSettings(): void {
  console.log(`shouldRegisterWebhook()   == ${shouldRegisterWebhook()}`);
  console.log(`shouldSimulateWebhook()   == ${shouldSimulateWebhook()}`);
  console.log(`shouldSimulateBanking()   == ${shouldSimulateBanking()}`);
  console.log(`isDwollaProduction()      == ${isDwollaProduction()}`);
  console.log(`shouldUseManagedSecrets() == ${shouldUseManagedSecrets()}`);
}

function isObject(obj) {
  return Object.prototype.toString.call(obj) === "[object Object]";
}

export function isEmptyObject(i: unknown): boolean {
  if (!i || !isObject(i)) return true;
  const keys = Object.keys(i);

  return Boolean(keys.length);
}
