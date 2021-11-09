import { ObjectId } from "mongoose";
import { UserService as UserDatabaseService } from "src/database/service";
import { Business, Customer, DwollaId, IBusinessDwollaId, ICustomerDwollaId, IDBUser } from "src/types";
import { log } from "src/utils";

type GenericDatabaseResponse<T, E = string> = { success: boolean, data?: T, error?: E };

export async function createUser(data: Pick<IDBUser, 'email' | 'consent' | 'customer' | 'business'>, type: 'customer' | 'business'): Promise<GenericDatabaseResponse<IDBUser>> {
	let response;
	if (type === 'customer') {
		response = await createCustomer({ email: data.email, consent: data.consent, customer: data.customer });
	} else if (type === 'business') {
		response = await createBusiness({ email: data.email, consent: data.consent, business: data.business });
	}

	return response;
}

async function createCustomer(input: Pick<IDBUser, 'email' | 'consent' | 'customer'>)
	: Promise<GenericDatabaseResponse<IDBUser>> {
	try {
		if (!input?.email || !input?.customer || !input?.consent) return {
			success: false, error: "Invalid Inputs"
		};
		const user: IDBUser = await UserDatabaseService.create<IDBUser>({
			consent: input.consent,
			verifiedCustomer: true,
			verifiedBusiness: false,
			customer: { 
				firstName: input.customer.firstName,
				lastName: input.customer.lastName,
				address1: input.customer.address1,
				address2: input.customer.address2,
				city: input.customer.city,
				state: input.customer.state,
				postalCode: input.customer.postalCode,
				avatar: input.customer.avatar,
				tag: input.customer.tag,
			},
			email: input.email,
		});
		// delete user?.customer?._id;
		return { success: true, data: user };
	} catch (error) {
		log(error);
		return { success: false, error: "Something went wrong!" };
	}
};

async function createBusiness(input: Pick<IDBUser, 'email' | 'consent' | 'business'>)
	: Promise<GenericDatabaseResponse<IDBUser>> {
	try {
		if (!input?.email || !input?.business || !input?.consent) return {
			success: false, error: "Invalid Inputs"
		};
		const user: IDBUser = await UserDatabaseService.create<IDBUser>({
			consent: input.consent,
			verifiedCustomer: false,
			verifiedBusiness: true,
			business: input.business,
			email: input.email,
		});
		// delete user?.business?._id;
		return { success: true, data: user };
	} catch (error) {
		log(error);
		return { success: false, error: "Something went wrong!" };
	}
};

export async function addCustomer(dwollaId: DwollaId,
	verification: { customer: Customer }): Promise<GenericDatabaseResponse<IDBUser>> {
	try {
		if (!verification?.customer || !dwollaId) { return { success: false, error: "Invalid Inputs" } };
		const filter: IBusinessDwollaId = { 'business.dwollaId': dwollaId };
		const response = await UserDatabaseService.update<IDBUser>(filter,
			{ customer: verification.customer, verifiedCustomer: true });
		return { success: true, data: response };
	} catch (error) {
		console.log(error);
		return { success: false, error: "Something went wrong!" };
	}
}

export async function updateDwollaDetails(
	filter: ObjectId, 
	update: { dwollaId: string, resourceUri: string }, 
	type: 'customer' | 'business'): Promise<GenericDatabaseResponse<IDBUser>> {
	try {
		const f = { '_id': filter };
		const currentUser = await UserDatabaseService.get<IDBUser>(f);
		const u = type === "business"
			? { verifiedBusiness: true, business: { ...currentUser?.business, owner: currentUser.business.owner, resourceUri: update.resourceUri, dwollaId: update.dwollaId } }
			: { verifiedCustomer: true, customer: { ...currentUser?.customer, resourceUri: update.resourceUri, dwollaId: update.dwollaId } }
		const response = await UserDatabaseService.update<IDBUser>(f, u);
		return { success: true, data: response };
	} catch (error) {
		return { success: false, error: "Something went wrong!" }
	}
};

export async function addBusiness(dwollaId: DwollaId,
	verification: { business: Business }): Promise<GenericDatabaseResponse<IDBUser>> {
	try {
		if (!verification?.business || !dwollaId) { return { success: false, error: "Invalid Inputs" } };
		const filter: ICustomerDwollaId = { 'customer.dwollaId': dwollaId };
		const response = await UserDatabaseService.update<IDBUser>(filter,
			{ business: verification.business, verifiedBusiness: true });
		return { success: true, data: response };
	} catch (error) {
		return { success: false, error: "Something went wrong!" }
	}
}

export async function getUser(dwollaId: string, type: 'customer' | 'business'): Promise<GenericDatabaseResponse<IDBUser>> {
	try {
		const f = type === 'business' ? { 'business.dwollaId': dwollaId } : { 'customer.dwollaId': dwollaId }
		const response = await UserDatabaseService.get<IDBUser>(f);
		return { success: true, data: response };
	} catch (error) {
		return { success: false, error: "Something went wrong!" }
	}
};

interface UserData {
	name: string
}

export async function getUserData(dwollaId: string): Promise<GenericDatabaseResponse<UserData>> {
	try {
		const businessFilter = { 'business.dwollaId': dwollaId }
		const customerFilter = { 'customer.dwollaId': dwollaId }
		const response: UserData = {
			name: ''
		}
		const c = await UserDatabaseService.get<IDBUser>(customerFilter);
		const b = await UserDatabaseService.get<IDBUser>(businessFilter);
		if(c) {
			response.name = `${c.customer.firstName} ${c.customer.lastName}`;
		} else if (b) {
			response.name = b.business.rbn;
		}
		return { success: true, data: response };
	} catch (error) {
		return { success: false, error: "Something went wrong!" }
	}
};

export async function updateUser(dwollaId: string, update: any, type: 'business' | 'customer'):  Promise<GenericDatabaseResponse<IDBUser>>{
	try {
		const f = type === 'business' ? { 'business.dwollaId': dwollaId } : { 'customer.dwollaId': dwollaId }
		const response = await UserDatabaseService.update<IDBUser>(f, update);
		return { success: true, data: response };
	} catch (error) {
		return { success: false, error: "Something went wrong!" }
	}
};