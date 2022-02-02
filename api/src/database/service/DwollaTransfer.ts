import { DwollaTransfer } from "../schema";
import { removeMongoMeta } from "../utils/index";

export interface ICreateDwollaTransferDBItem {
  fundingTransferId?: string;
  fundingStatus?: string;
  fundedTransferId?: string;
  fundedStatus?: string;
  userId: string;
  operatorId: string;
  fundingSource: string;
  fundingTarget: string;
  amount: string;
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
    fundingTransferId: input.fundingTransferId,
    fundingStatus: input.fundingStatus,
    fundedTransferId: input.fundedTransferId,
    fundedStatus: input.fundedStatus,
    userId: input.userId,
    operatorId: input.operatorId,
    fundingSource: input.fundingSource,
    fundingTarget: input.fundingTarget,
    amount: input.amount,
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

export async function getByFundingTransferId(
  fundingTransferId: string
): Promise<IDwollaTransferDBItem> {
  const response = await DwollaTransfer.find({
    fundingTransferId: fundingTransferId,
  });
  if (response?.length > 0) return removeMongoMeta(response[0].toObject());
  else
    throw Error(
      `No match in database for DwollaTransfer with fundingTransferId ${fundingTransferId}`
    );
}

export async function getByFundedTransferId(
  fundedTransferId: string
): Promise<IDwollaTransferDBItem> {
  const response = await DwollaTransfer.find({
    fundedTransferId: fundedTransferId,
  });
  if (response?.length > 0) return removeMongoMeta(response[0].toObject());
  else
    throw Error(
      `No match in database for DwollaTransfer with fundedTransferId ${fundedTransferId}`
    );
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

export async function updateStatusByFundingTransferId(
  fundingTransferId: string,
  fundingStatus: string
): Promise<boolean> {
  const response = await DwollaTransfer.updateOne(
    { fundingTransferId: fundingTransferId },
    { fundingStatus: fundingStatus, updated: Date.now() }
  );
  if (response.n == 0 || response.nModified == 0)
    throw Error(
      `No match in database for DwollaTransfer with fundingTransferId ${fundingTransferId}`
    );
  return true;
}

export async function setFundedTransferId(
  fundingTransferId: string,
  fundedTransferId: string
): Promise<boolean> {
  const response = await DwollaTransfer.updateOne(
    { fundingTransferId: fundingTransferId },
    { fundedTransferId: fundedTransferId, updated: Date.now() }
  );
  if (response.n == 0 || response.nModified == 0)
    throw Error(
      `No match in database for DwollaTransfer with fundingTransferId ${fundingTransferId}`
    );
  return true;
}

export async function setFundingTransferId(
  fundedTransferId: string,
  fundingTransferId: string
): Promise<boolean> {
  const response = await DwollaTransfer.updateOne(
    { fundedTransferId: fundedTransferId },
    { fundingTransferId: fundingTransferId, updated: Date.now() }
  );
  if (response.n == 0 || response.nModified == 0)
    throw Error(
      `No match in database for DwollaTransfer with fundedTransferId ${fundedTransferId}`
    );
  return true;
}

export async function updateStatusByFundedTransferId(
  fundedTransferId: string,
  fundedStatus: string
): Promise<boolean> {
  const response = await DwollaTransfer.updateOne(
    { fundedTransferId: fundedTransferId },
    { fundedStatus: fundedStatus, updated: Date.now() }
  );
  if (response.n == 0 || response.nModified == 0)
    throw Error(
      `No match in database for DwollaTransfer with fundedTransferId ${fundedTransferId}`
    );
  return true;
}
