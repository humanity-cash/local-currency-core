import { AppNotification } from "../schema";
import { removeMongoMeta } from "../utils/index";

export interface ICreateAppNotificationDBItem {
  userId: string;
  timestamp: number;
  message: string;
  closed?: boolean;
  level: string;
}

export interface IAppNotificationDBItem extends ICreateAppNotificationDBItem {
  dbId: string;
}

export async function create(
  input: ICreateAppNotificationDBItem
): Promise<IAppNotificationDBItem> {
  const appNotificationItem = new AppNotification({
    userId: input.userId,
    timestamp: input.timestamp,
    message: input.message,
    closed: false,
    level: input.level,
  });
  const response = await appNotificationItem.save();
  return removeMongoMeta(response.toObject());
}

export async function close(dbId: string): Promise<boolean> {
  const response = await AppNotification.updateOne(
    { _id: dbId },
    { closed: true }
  );
  if (response.n == 0 || response.nModified == 0)
    throw Error(`No match in database for AppNotification with dbId ${dbId}`);
  return true;
}

export async function get(dbId: string): Promise<IAppNotificationDBItem> {
  const response = await AppNotification.findById(dbId);
  return removeMongoMeta(response.toObject());
}

export async function findByUserId(
  userId: string
): Promise<IAppNotificationDBItem[]> {
  const response = await AppNotification.find({ userId: userId });
  const items: IAppNotificationDBItem[] = [];
  if (response?.length > 0) {
    response.forEach((item) => {
      const pushItem = removeMongoMeta(item.toObject());
      if(!pushItem.closed)
        items.push(pushItem);
    });
  }
  return items;
}
