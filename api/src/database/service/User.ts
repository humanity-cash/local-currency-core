/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { ObjectId } from "mongoose";
import { IBusinessDwollaId, ICustomerDwollaId, INewUserInput } from "src/types";
import { User as UserSchema } from "../schema";
import { removeMongoMeta } from "../utils/index";

export async function create<T>(input: INewUserInput): Promise<T> {
	const user = new UserSchema({
		...input
	});
	const response = await user.save();
	return removeMongoMeta(response?.toObject());
};

type UserFilter = IBusinessDwollaId | ICustomerDwollaId | { "_id": ObjectId };

export async function update<T>(filter: UserFilter, update: any): Promise<T> {
	const response = await UserSchema.findOneAndUpdate(filter, update, { upsert: false, new: true });
	return removeMongoMeta(response?.toObject());
}

export async function get<T>(filter: Record<string, string | boolean | ObjectId>): Promise<T> {
	const response = await UserSchema.findOne(filter);
	return removeMongoMeta(response?.toObject());
}
