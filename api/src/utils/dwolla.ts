import { IDBUser, IDwollaNewUserInput } from "src/types";

export function constructCreateUserInput(
	data: IDBUser,
	type: "customer" | "business",
	isNew: boolean
): IDwollaNewUserInput {
	const email = isNew ? data.email : `${data.dbId}@humanity.cash`;
	if (type === "customer") {
		const dwollaDetails: IDwollaNewUserInput = {
			email,
			firstName: data.customer.firstName,
			lastName: data.customer.lastName,
			city: data.customer.city,
			state: data.customer.state || 'LA',
			postalCode: data.customer.postalCode,
			address1: data.customer.address1,
			address2: data.customer.address2,
			correlationId: `customer-${data.dbId}`,
		};
		return dwollaDetails;
	} else if (type === "business") {
		const dwollaDetails: IDwollaNewUserInput = {
			email,
			firstName: data.business.owner.firstName,
			lastName: data.business.owner.lastName,
			city: data.business.city,
			state: data.business.state,
			postalCode: data.business.postalCode,
			address1: data.business.address1,
			address2: data.business.address2,
			correlationId: `business-${data.dbId}`,
			rbn: data.business.rbn,
		};
		return dwollaDetails;
	}
}
