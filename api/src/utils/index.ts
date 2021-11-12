import { AppNotificationService } from "src/database/service";
import * as cryptoUtils from "./crypto";
import * as httpUtils from "./http";
import * as csvUtils from "./csv";
import { GenericDatabaseResponse, IDBUser } from "src/types";
// import { LogService } from "src/database/service";

export { cryptoUtils, httpUtils, csvUtils };

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
export function shouldDeletePriorWebhooks(): boolean {
  return (
    process.env.DELETE_PRIOR_WEBHOOK == "true" ||
    process.env.DELETE_PRIOR_WEBHOOK == "TRUE"
  );
}

export function logSettings(): void {
  console.log(`shouldRegisterWebhook()     == ${shouldRegisterWebhook()}`);
  console.log(`shouldSimulateWebhook()     == ${shouldSimulateWebhook()}`);
  console.log(`shouldSimulateBanking()     == ${shouldSimulateBanking()}`);
  console.log(`isDwollaProduction()        == ${isDwollaProduction()}`);
  console.log(`shouldUseManagedSecrets()   == ${shouldUseManagedSecrets()}`);
  console.log(`shouldDeletePriorWebhooks() == ${shouldDeletePriorWebhooks()}`);
}

function isObject(obj) {
  return Object.prototype.toString.call(obj) === "[object Object]";
}

export function isEmptyObject(i: unknown): boolean {
  if (!i || !isObject(i)) return true;
  const keys = Object.keys(i);

  return Boolean(keys.length);
}

export async function retryFunction(promise: Promise<GenericDatabaseResponse<IDBUser, string>>, count = 3):
  Promise<GenericDatabaseResponse<IDBUser>> {
  let response = {} as GenericDatabaseResponse<IDBUser>;
  let i = 0;
  while (i < count && !response?.success) {
    const result = await promise;
    if (result.success) {
      response = result;
      break;
    }
    response = result;
    i++;
  }

  return response;
}