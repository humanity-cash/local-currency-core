import { AppNotificationService } from "src/database/service";
import * as cryptoUtils from "./crypto";
import * as httpUtils from "./http";
import * as csvUtils from "./csv";
import * as dwollaUtils from "./dwolla";
import * as textUtils from "./text";
import { getProvider } from "./getProvider";

export { cryptoUtils, httpUtils, csvUtils, dwollaUtils, textUtils };

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
    process.env.SIMULATE_BANKING == "true" ||
    process.env.SIMULATE_BANKING == "TRUE"
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
export function shouldUseMongoTLS(): boolean {
  return (
    process.env.USE_MONGO_TLS == "true" || process.env.USE_MONGO_TLS == "TRUE"
  );
}
export function shouldRunTransferReconciliation(): boolean {
  return (
    process.env.TRANSFER_RECONCILE_ON_STARTUP == "true" ||
    process.env.TRANSFER_RECONCILE_ON_STARTUP == "TRUE"
  );
}

export function logSettings(): void {
  console.log(`shouldRegisterWebhook()     == ${shouldRegisterWebhook()}`);
  console.log(`shouldSimulateWebhook()     == ${shouldSimulateWebhook()}`);
  console.log(`shouldSimulateBanking()     == ${shouldSimulateBanking()}`);
  console.log(`isDwollaProduction()        == ${isDwollaProduction()}`);
  console.log(`shouldUseManagedSecrets()   == ${shouldUseManagedSecrets()}`);
  console.log(`shouldDeletePriorWebhooks() == ${shouldDeletePriorWebhooks()}`);
  console.log(`shouldUseMongoTLS()         == ${shouldUseMongoTLS()}`);
}

function isObject(obj) {
  return Object.prototype.toString.call(obj) === "[object Object]";
}

export function isEmptyObject(i: unknown): boolean {
  if (!i || !isObject(i)) return true;
  const keys = Object.keys(i);

  return Boolean(keys.length);
}

export async function getOperatorDisplayName(
  fromAddress: string
): Promise<string> {
  const { operators } = await getProvider();
  let displayName: string;

  log(
    `utils.ts::getOperatorDisplayName: Operators are ${operators}, fromAddress is ${fromAddress}`
  );

  for (let i = 0; i < operators.length; i++) {
    if (fromAddress.toLowerCase() == operators[i].toLowerCase()) {
      displayName = process.env[`OPERATOR_${i + 1}_DISPLAY_NAME`];
    }
  }

  if (!displayName)
    throw `Display name for operator ${fromAddress} cannot be found, incorrect environment variable configuration`;

  return displayName;
}

export async function getOperatorUserId(fromAddress: string): Promise<string> {
  const { operators } = await getProvider();
  log(
    `utils.ts::getOperatorUserId: Operators are ${operators}, fromAddress is ${fromAddress}`
  );
  let userId: string;

  for (let i = 0; i < operators.length; i++) {
    if (fromAddress.toLowerCase() == operators[i].toLowerCase()) {
      userId = process.env[`OPERATOR_${i + 1}_DWOLLA_USER_ID`];
    }
  }

  if (!userId)
    throw `UserId for operator ${fromAddress} cannot be found, incorrect environment variable configuration`;

  return userId;
}

export function avatarUrlGenerator(id: string): string {
  const IMGX_BASE_URL = process.env.IMGIX_PROFILE_PICTURE_URL;
  const query = `${id}-profile-picture.jpg`;

  return `${IMGX_BASE_URL}${query}`;
}
