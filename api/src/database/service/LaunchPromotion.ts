import { LaunchPromotion } from "../schema";
import { removeMongoMeta } from "../utils/index";

export interface ICreateLaunchPromotionDBItem {
  fingerprint: string;
  promotionAmount: string;
}

export interface ILaunchPromotionDBItem extends ICreateLaunchPromotionDBItem {
  dbId: string;
}

export async function create(
  input: ICreateLaunchPromotionDBItem
): Promise<ILaunchPromotionDBItem> {
  const item = new LaunchPromotion({
    fingerprint: input.fingerprint,
    promotionAmount: input.promotionAmount,
  });
  const response = await item.save();
  return removeMongoMeta(response.toObject());
}

export async function findByFingerprint(
  fingerprint: string
): Promise<ILaunchPromotionDBItem[]> {
  const response = await LaunchPromotion.find({ fingerprint: fingerprint });
  if (response?.length > 0) return removeMongoMeta(response[0].toObject());
  else return undefined;
}

export async function getCount() : Promise<number> {
  const response = await LaunchPromotion.find();
  return response.length;
}
