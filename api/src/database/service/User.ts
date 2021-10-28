import { IBusinessDowllaId, ICustomerDowllaId, UpdateUser, User } from "src/types";
import { User as UserSchema } from "../schema";
import { removeMongoMeta } from "../utils/index";


export async function create<T>(input: User): Promise<T> {
	const user = new UserSchema({
		...input
	});
	const response = await user.save();

	return removeMongoMeta(response.toObject());
};

type UserFilter = IBusinessDowllaId | ICustomerDowllaId;

export async function update(filter: UserFilter, update: UpdateUser): Promise<any> {
	const response = await UserSchema.findOneAndUpdate(filter, update, { upsert: false, new: true });
	return removeMongoMeta(response.toObject());
}

export async function get(email: string): Promise<any> {
	const response = await UserSchema.findOne({ email });
	return removeMongoMeta(response.toObject());
}
