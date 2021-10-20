import mongoose from "mongoose";

export const BusinessSchema = new mongoose.Schema({
	story: String,
	tag: String,
	avatar: String,
	type: String,
	rbn: String,
	industry: String,
	ein: String,
	address1: String,
	address2: String,
	city: String,
	state: String,
	postalCode: String,
	phoneNumber: String,
	dowllaId: String,
	resourceUri: String,
	owner: {
		firstName: String,
		lastName: String,
		address1: String,
		address2: String,
		city: String,
		state: String,
		postalCode: String
	}
})

export const BusinessModel = mongoose.model("Business", BusinessSchema);

export const CustomerSchema = new mongoose.Schema({
	avatar: String,
	tag: String,
	address1: String,
	address2: String,
	city: String,
	state: String,
	postalCode: String,
	firstName: String,
	lastName: String,
	dowllaId: String,
	resourceUri: String,

})

export const CustomerModel = mongoose.model("Customer", CustomerSchema);

const UserSchema = new mongoose.Schema({
	consent: { type: Boolean, required: true },
	verifiedCustomer: { type: Boolean, required: true },
	verifiedBusiness: { type: Boolean, required: true },
	email: { type: String, unique: true, required: true },
	business: BusinessSchema,
	customer: CustomerSchema,
}, { timestamps: true });

export default mongoose.model("User", UserSchema);
