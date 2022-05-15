import {
  FilterQuery,
  QueryOptions,
  UpdateQuery,
  UpdateWithAggregationPipeline,
} from "mongoose";
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
  txId?: string;
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
    txId: input.txId,
  });
  const response = await dwollaTransferItem.save();
  return removeMongoMeta(response.toObject());
}

export async function get(dbId: string): Promise<IDwollaTransferDBItem> {
  const response = await DwollaTransfer.findById(dbId);
  return removeMongoMeta(response.toObject());
}

export async function getAll(type?: string): Promise<IDwollaTransferDBItem[]> {
  let response;

  if (type) response = await DwollaTransfer.find({ type: type });
  else response = await DwollaTransfer.find({});

  if (response?.length > 0) {
    const result: IDwollaTransferDBItem[] = [];
    response.forEach((element) =>
      result.push(removeMongoMeta(element.toObject()))
    );
    return result;
  } else return undefined;
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

export async function getByTxId(txId: string): Promise<IDwollaTransferDBItem> {
  const response = await DwollaTransfer.find({
    txId: txId,
  });
  if (response?.length > 0) return removeMongoMeta(response[0].toObject());
  else throw Error(`No match in database for DwollaTransfer with txId ${txId}`);
}

async function findOneAndUpdate(
  query: FilterQuery<unknown>,
  update: UpdateWithAggregationPipeline | UpdateQuery<unknown>,
  options: QueryOptions
): Promise<IDwollaTransferDBItem> {
  const response = await DwollaTransfer.findOneAndUpdate(
    query,
    update,
    options
  );
  if (!response)
    throw Error(
      `No match in database for DwollaTransfer with query ${JSON.stringify(
        query
      )}`
    );
  else return removeMongoMeta(response.toObject());
}

export async function updateStatusByFundingTransferId(
  fundingTransferId: string,
  fundingStatus: string
): Promise<IDwollaTransferDBItem> {
  const query: FilterQuery<unknown> = { fundingTransferId: fundingTransferId };
  const update: UpdateWithAggregationPipeline | UpdateQuery<unknown> = {
    fundingStatus: fundingStatus,
    updated: Date.now(),
  };
  const options: QueryOptions = { new: true };
  return findOneAndUpdate(query, update, options);
}

export async function updateStatusByFundedTransferId(
  fundedTransferId: string,
  fundedStatus: string
): Promise<IDwollaTransferDBItem> {
  const query: FilterQuery<unknown> = { fundedTransferId: fundedTransferId };
  const update: UpdateWithAggregationPipeline | UpdateQuery<unknown> = {
    fundedStatus: fundedStatus,
    updated: Date.now(),
  };
  const options: QueryOptions = { new: true };
  return findOneAndUpdate(query, update, options);
}

export async function setFundedTransferId(
  fundingTransferId: string,
  fundedTransferId: string
): Promise<IDwollaTransferDBItem> {
  const query: FilterQuery<unknown> = { fundingTransferId: fundingTransferId };
  const update: UpdateWithAggregationPipeline | UpdateQuery<unknown> = {
    fundedTransferId: fundedTransferId,
    updated: Date.now(),
  };
  const options: QueryOptions = { new: true };
  return findOneAndUpdate(query, update, options);
}

export async function setFundingTransferId(
  fundedTransferId: string,
  fundingTransferId: string
): Promise<IDwollaTransferDBItem> {
  const query: FilterQuery<unknown> = { fundedTransferId: fundedTransferId };
  const update: UpdateWithAggregationPipeline | UpdateQuery<unknown> = {
    fundingTransferId: fundingTransferId,
    updated: Date.now(),
  };
  const options: QueryOptions = { new: true };
  return findOneAndUpdate(query, update, options);
}

export async function updateTxIdByFundingTransferId(
  fundingTransferId: string,
  txId: string
): Promise<IDwollaTransferDBItem> {
  const query: FilterQuery<unknown> = { fundingTransferId: fundingTransferId };
  const update: UpdateWithAggregationPipeline | UpdateQuery<unknown> = {
    txId: txId,
    updated: Date.now(),
  };
  const options: QueryOptions = { new: true };
  return findOneAndUpdate(query, update, options);
}
