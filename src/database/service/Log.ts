import { Log } from "../schema";
import { removeMongoMeta } from "../utils/index";

export interface ICreateLogDBItem {
  timestamp: number;
  message: string;
}

export interface ILogDBItem extends ICreateLogDBItem {
  dbId: string;
}

export async function create(input: ICreateLogDBItem): Promise<ILogDBItem> {
  const logItem = new Log({
    timestamp: input.timestamp,
    message: input.message,
  });
  // Use Mongo driver option "write concern" of 0 which doesn't
  // wait for I/O confirmation and should be faster for logging
  const response = await logItem.save({ w: 0, j: false });
  return removeMongoMeta(response.toObject());
}

export async function get(dbId: string): Promise<ILogDBItem> {
  const response = await Log.findById(dbId);
  return removeMongoMeta(response.toObject());
}
