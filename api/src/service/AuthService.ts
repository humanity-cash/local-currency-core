import { BusinessModel, CustomerModel } from "src/database/schema/User";
import { UserService as UserDatabaseService } from "src/database/service";

export async function createUser({ email, consent }) {
	const user = await UserDatabaseService.create({ email, consent });

	return user;
}

export async function verifyCustomer({ email, customer }) {
	const customerData = new CustomerModel({ ...customer })
	const user = await UserDatabaseService.update(email, { customer: customerData, verifiedCustomer: true });

	return user;
}

export async function verifyBusiness({ email, business }) {
	const businessData = new BusinessModel({ ...business })
	const user = await UserDatabaseService.update(email, { business: businessData, verifiedBusiness: true });
	return user;
}
