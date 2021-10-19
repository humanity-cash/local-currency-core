import { DwollaTransfer } from "../schema";
import { removeMongoMeta } from "../utils/index";

export interface ICreateDwollaTransferDBItem {
  id: string;
  userId: string;
  operatorId: string;
  fundingSource: string;
  fundingTarget: string;
  amount: string;
  status: string;
  type: string;
  created: number;
  updated: number;
}

export interface IDwollaTransferDBItem extends ICreateDwollaTransferDBItem {
  dbId: string;
}

export async function create(
  input: ICreateDwollaTransferDBItem
): Promise<IDwollaTransferDBItem> {
  const dwollaTransferItem = new DwollaTransfer({
    id: input.id,
    userId: input.userId,
    operatorId: input.operatorId,
    fundingSource: input.fundingSource,
    fundingTarget: input.fundingTarget,
    amount: input.amount,
    status: input.status,
    type: input.type,
    created: input.created,
    updated: input.updated,
  });
  const response = await dwollaTransferItem.save();
  return removeMongoMeta(response.toObject());
}

export async function get(dbId: string): Promise<IDwollaTransferDBItem> {
  const response = await DwollaTransfer.findById(dbId);
  return removeMongoMeta(response.toObject());
}

export async function getById(id: string): Promise<IDwollaTransferDBItem> {
  const response = await DwollaTransfer.find({ id: id });
  if (response?.length > 0) return removeMongoMeta(response[0].toObject());
  else return undefined;
}

export async function getByUserId(
  userId: string
): Promise<IDwollaTransferDBItem[]> {
  const response = await DwollaTransfer.find({ userId: userId });
  if (response?.length > 0) {
    const result: IDwollaTransferDBItem[] = [];
    response.forEach((element) =>
      result.push(removeMongoMeta(element.toObject()))
    );
    return result;
  } else return undefined;
}

export async function updateStatus(
  id: string,
  status: string
): Promise<boolean> {
  const response = await DwollaTransfer.updateOne(
    { id: id },
    { status: status, updated: Date.now() }
  );
  if (response.n == 0 || response.nModified == 0)
    throw Error(`No match in database for DwollaTransfer with id ${id}`);
  return true;
}
