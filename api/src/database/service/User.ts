import { IBusinessDowllaId, ICustomerDowllaId, INewUserInput, UpdateUser } from "src/types";
import { User as UserSchema } from "../schema";
import { removeMongoMeta } from "../utils/index";

export async function create<T>(input: INewUserInput): Promise<T> {
	const user = new UserSchema({
		...input
	});
	const response = await user.save();
	return removeMongoMeta(response?.toObject());
};

type UserFilter = IBusinessDowllaId | ICustomerDowllaId;

export async function update<T>(filter: UserFilter, update: UpdateUser): Promise<T> {
	const response = await UserSchema.findOneAndUpdate(filter, update, { upsert: false, new: true });
	return removeMongoMeta(response?.toObject());
}

export async function get(email: string): Promise<any> {
	const response = await UserSchema.findOne({ email });
	return removeMongoMeta(response?.toObject());
}
