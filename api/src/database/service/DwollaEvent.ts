import { DwollaEvent } from "../schema";
import { removeMongoMeta } from "../utils/index";

export interface ICreateDwollaEventDBItem {
  eventId: string;
  created: string;
  topic: string;
  resourceId: string;
}

export interface IDwollaEventDBItem extends ICreateDwollaEventDBItem {
  dbId: string;
}

export async function create(
  input: ICreateDwollaEventDBItem
): Promise<IDwollaEventDBItem> {
  const dwollaEventItem = new DwollaEvent({
    eventId: input.eventId,
    created: input.created,
    topic: input.topic,
    resourceId: input.resourceId,
  });
  const response = await dwollaEventItem.save();
  return removeMongoMeta(response.toObject());
}

export async function get(dbId: string): Promise<IDwollaEventDBItem> {
  const response = await DwollaEvent.findById(dbId);
  return removeMongoMeta(response.toObject());
}

export async function findByObject(
  eventId: string
): Promise<IDwollaEventDBItem> {
  const response = await DwollaEvent.find({ eventId: eventId }, "eventId");
  if (response?.length > 0) return removeMongoMeta(response[0].toObject());
  else return undefined;
}
