import { User } from "src/types";
import { User as UserSchema } from "../schema";
import { removeMongoMeta } from "../utils/index";

export async function create(input: Omit<User, 'verifiedCustomer' | 'verifiedBusiness'>): Promise<any> {
		const user = new UserSchema({
			consent: input.consent,
			verifiedCustomer: false,
			verifiedBusiness: false,
			email: input.email,
		});
		const response = await user.save();
		return  removeMongoMeta(response.toObject());
};

export async function update(email: string, update: any): Promise<any> {
	const response = await UserSchema.findOneAndUpdate({ email }, update, { upsert: false, new: true });
	return removeMongoMeta(response.toObject());
}

export async function get(email: string): Promise<any> {
	const response = await UserSchema.findOne({ email });
	return removeMongoMeta(response.toObject());
}
