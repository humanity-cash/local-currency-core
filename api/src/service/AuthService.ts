import { UserService as UserDatabaseService } from "src/database/service";
import { DowllaId, IAddBusinessVerification, IAddCustomerVerification, IBusinessDowllaId, ICustomerDowllaId, INewBusinessDocument, INewCustomerDocument, User } from "src/types";
import { log } from "src/utils";

type GenericDatabaseResponse<T, E = string> = { success: boolean, data?: T, error?: E };

export async function createCustomer(input: Pick<User, 'email' | 'consent' | 'customer'>)
	: Promise<GenericDatabaseResponse<INewCustomerDocument>> {
	try {
		if (!input?.email || !input?.customer || !input?.consent) return {
			success: false, error: "Invalid Inputs"
		};
		const user: INewCustomerDocument = await UserDatabaseService.create<INewCustomerDocument>({
			consent: input.consent,
			verifiedCustomer: true,
			verifiedBusiness: false,
			customer: input.customer,
			email: input.email,
		});
		delete user.customer._id;
		return { success: true, data: user };
	} catch (error) {
		log(error);
		return { success: false, error: "Something went wrong!" };
	}
};

export async function createBusiness(input: Pick<User, 'email' | 'consent' | 'business'>)
	: Promise<GenericDatabaseResponse<INewBusinessDocument>> {
	try {
		if (!input?.email || !input?.business || !input?.consent) return {
			success: false, error: "Invalid Inputs"
		};
		const user = await UserDatabaseService.create<INewBusinessDocument>({
			consent: input.consent,
			verifiedCustomer: false,
			verifiedBusiness: true,
			business: input.business,
			email: input.email,
		});
		delete user.business._id;
		return { success: true, data: user };
	} catch (error) {
		log(error);
		return { success: false, error: "Something went wrong!" };
	}
};

export async function addCustomerVerification(dowllaId: DowllaId,
	verification: IAddCustomerVerification): Promise<any> {
	const filter: IBusinessDowllaId = { 'business': { 'dowllaId': dowllaId } };
	const response = await UserDatabaseService.update(filter,
		{ ...verification, verifiedCustomer: true });
	return response;
}

export async function addBusinessVerification(dowllaId: DowllaId,
	verification: IAddBusinessVerification): Promise<any> {
	const filter: ICustomerDowllaId = { 'customer': { 'dowllaId': dowllaId } };
	const response = await UserDatabaseService.update(filter,
		{ ...verification, verifiedBusiness: true });
	return response;
}
