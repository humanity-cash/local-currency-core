import { ObjectId } from "mongoose";
import { UserService as UserDatabaseService } from "src/database/service";
import {
  Business,
  Customer,
  DwollaId,
  GenericDatabaseResponse,
  IBusinessDwollaId,
  ICustomerDwollaId,
  IDBUser,
  WalletAddress,
} from "src/types";
import { avatarUrlGenerator, log } from "src/utils";

export async function createUser(
  data: Pick<IDBUser, "email" | "consent" | "customer" | "business">,
  type: "customer" | "business"
): Promise<GenericDatabaseResponse<IDBUser>> {
  let response: GenericDatabaseResponse<IDBUser>;
  if (type === "customer") {
    response = await createCustomer({
      email: data.email,
      consent: data.consent,
      customer: data.customer,
    });
  } else if (type === "business") {
    response = await createBusiness({
      email: data.email,
      consent: data.consent,
      business: data.business,
    });
  }

  return response;
}

async function createCustomer(
  input: Pick<IDBUser, "email" | "consent" | "customer">
): Promise<GenericDatabaseResponse<IDBUser>> {
  try {
    if (!input?.email || !input?.customer || !input?.consent)
      return {
        success: false,
        error: "Invalid Inputs",
      };
    const user: IDBUser = await UserDatabaseService.create<IDBUser>({
      consent: input.consent,
      verifiedCustomer: true,
      verifiedBusiness: false,
      customer: {
        firstName: input?.customer?.firstName || "",
        lastName: input?.customer?.lastName || "",
        address1: input?.customer?.address1 || "",
        address2: input?.customer?.address2 || "",
        city: input?.customer?.city || "",
        state: input?.customer?.state || "",
        postalCode: input?.customer?.postalCode || "",
        avatar: process.env.CUSTOMER_DEFAULT_AVATAR_URL,
        tag: input?.customer?.tag || "",
      },
      email: input.email,
    });
    // delete user?.customer?._id;
    return { success: true, data: user };
  } catch (error) {
    log(error);
    return { success: false, error };
  }
}

async function createBusiness(
  input: Pick<IDBUser, "email" | "consent" | "business">
): Promise<GenericDatabaseResponse<IDBUser>> {
  try {
    if (!input?.email || !input?.business || !input?.consent)
      return {
        success: false,
        error: "Invalid Inputs",
      };
    const user: IDBUser = await UserDatabaseService.create<IDBUser>({
      consent: input.consent,
      verifiedCustomer: false,
      verifiedBusiness: true,
      business: {
        ...input.business,
        avatar: process.env.BUSINESS_DEFAULT_AVATAR_URL,
      },
      email: input.email,
    });
    return { success: true, data: user };
  } catch (error) {
    log(error);
    return { success: false, error };
  }
}

export async function addCustomer(
  dwollaId: DwollaId,
  verification: { customer: Customer }
): Promise<GenericDatabaseResponse<IDBUser>> {
  try {
    if (!verification?.customer || !dwollaId) {
      return { success: false, error: "Invalid Inputs" };
    }
    const filter: IBusinessDwollaId = { "business.dwollaId": dwollaId };
    const response = await UserDatabaseService.update<IDBUser>(filter, {
      customer: {
        ...verification.customer,
        avatar: process.env.CUSTOMER_DEFAULT_AVATAR_URL,
      },
      verifiedCustomer: true,
    });
    return { success: true, data: response };
  } catch (error) {
    log(error);
    return { success: false, error };
  }
}

export async function updateDwollaDetails(
  filter: ObjectId,
  update: { dwollaId: string; resourceUri: string },
  type: "customer" | "business"
): Promise<GenericDatabaseResponse<IDBUser>> {
  try {
    const f = { _id: filter };
    const currentUser = await UserDatabaseService.get<IDBUser>(f);
    const u =
      type === "business"
        ? {
            verifiedBusiness: true,
            business: {
              ...currentUser?.business,
              owner: currentUser.business.owner,
              resourceUri: update.resourceUri,
              dwollaId: update.dwollaId,
            },
          }
        : {
            verifiedCustomer: true,
            customer: {
              ...currentUser?.customer,
              resourceUri: update.resourceUri,
              dwollaId: update.dwollaId,
            },
          };
    const response = await UserDatabaseService.update<IDBUser>(f, u);
    return { success: true, data: response };
  } catch (error) {
    log(error);
    return { success: false, error };
  }
}

export async function addBusiness(
  dwollaId: DwollaId,
  verification: { business: Business }
): Promise<GenericDatabaseResponse<IDBUser>> {
  try {
    if (!verification?.business || !dwollaId) {
      return { success: false, error: "Invalid Inputs" };
    }
    const filter: ICustomerDwollaId = { "customer.dwollaId": dwollaId };
    const response = await UserDatabaseService.update<IDBUser>(filter, {
      business: {
        ...verification.business,
        avatar: process.env.BUSINESS_DEFAULT_AVATAR_URL,
      },
      verifiedBusiness: true,
    });
    return { success: true, data: response };
  } catch (error) {
    log(error);
    return { success: false, error };
  }
}

export async function getUser(
  dwollaId: string
): Promise<GenericDatabaseResponse<IDBUser>> {
  try {
    const filter = {
      $or: [
        { "customer.dwollaId": dwollaId },
        { "business.dwollaId": dwollaId },
      ],
    };
    const response = await UserDatabaseService.get<IDBUser>(filter);
    return { success: true, data: response };
  } catch (error) {
    log(error);
    return { success: false, error };
  }
}

export async function getUserByEmail(
  email: string
): Promise<GenericDatabaseResponse<IDBUser>> {
  try {
    const filter = {
      email: email,
    };
    const response = await UserDatabaseService.get<IDBUser>(filter);
    return { success: true, data: response };
  } catch (error) {
    return { success: false, error };
  }
}

export async function getUserByWalletAddress(
  walletAddress: string
): Promise<GenericDatabaseResponse<IDBUser>> {
  try {
    const filter = {
      $or: [
        { "customer.walletAddress": walletAddress },
        { "business.walletAddress": walletAddress },
      ],
    };
    const response = await UserDatabaseService.get<IDBUser>(filter);
    return { success: true, data: response };
  } catch (error) {
    return { success: false, error };
  }
}

interface UserData {
  name: string;
  dwollaId: string;
}

export async function getUserData(
  walletAddress: WalletAddress
): Promise<GenericDatabaseResponse<UserData>> {
  try {
    const result: UserData = {
      name: "",
      dwollaId: "",
    };
    const response = await getUserByWalletAddress(walletAddress);
    if (!response.data || !response.success || response.error) {
      return { success: false, data: result };
    }
    const user = response.data;
    const isCustomer = user?.customer?.walletAddress === walletAddress;
    const isBusiness = user?.business?.walletAddress === walletAddress;
    if (isCustomer) {
      result.name = `${user.customer.firstName} ${user.customer.lastName}`;
      result.dwollaId = user.customer.dwollaId;
    } else if (isBusiness) {
      result.name = user.business.rbn;
      result.dwollaId = user.business.dwollaId;
    } else {
      return { success: false, error: "User not found!" };
    }

    return { success: true, data: result };
  } catch (error) {
    log(error);
    return { success: false, error };
  }
}

export async function updateUser(
  dwollaId: string,
  update: any,
  filter?: any
): Promise<GenericDatabaseResponse<IDBUser>> {
  try {
    const f = filter || {
      $or: [
        { "customer.dwollaId": dwollaId },
        { "business.dwollaId": dwollaId },
      ],
    };
    const response = await UserDatabaseService.update<IDBUser>(f, update);
    return { success: true, data: response };
  } catch (error) {
    log(error);
    return { success: false, error };
  }
}

export async function updateUserProfilePicture(
  dwollaId: string
): Promise<GenericDatabaseResponse<IDBUser>> {
  try {
    const getUserResponse = await getUser(dwollaId);
    const currentUser: IDBUser | undefined = getUserResponse?.data;
    if (!currentUser) {
      return { success: false, error: "User does not exist!" };
    }
    const isCustomer = currentUser.customer?.dwollaId === dwollaId;
    const update = isCustomer
      ? {
          customer: {
            ...currentUser?.customer,
            avatar: avatarUrlGenerator(dwollaId),
          },
        }
      : {
          business: {
            ...currentUser?.business,
            avatar: avatarUrlGenerator(dwollaId),
          },
        };
    const response = await updateUser(dwollaId, update);
    return { success: true, data: response?.data };
  } catch (error) {
    log(error);
    return { success: false, error };
  }
}

export interface UpdateWalletAddress {
  walletAddress: string;
  dwollaId: string;
}

export interface UpdateCustomerProfile {
  customerDwollaId: string;
  update: { tag: string };
}

export interface UpdateBusinessProfile {
  businessDwollaId: string;
  update: {
    tag: string;
    story: string;
    website: string;
    address1: string;
    address2: string;
    city: string;
    postalCode: string;
    state: string;
    phoneNumber: string;
    ein: string;
    ssn: string;
    industry: string;
  };
}

export async function updateBusinessProfile({
  businessDwollaId,
  update,
}: UpdateBusinessProfile): Promise<GenericDatabaseResponse<IDBUser>> {
  try {
    const response = await getUser(businessDwollaId);
    const { business } = response?.data;
    const u = {
      business: {
        ...business,
        owner: business.owner,
        tag: update.tag ? update.tag : business.tag,
        story: update.story ? update.story : business.story,
        website: update.website ? update.website : business.website,
        address1: update.address1 ? update.address1 : business.address1,
        address2: update.address2 ? update.address2 : business.address2,
        city: update.city ? update.city : business.city,
        postalCode: update.postalCode ? update.postalCode : business.postalCode,
        state: update.state ? update.state : business.state,
        phoneNumber: update.phoneNumber
          ? update.phoneNumber
          : business.phoneNumber,
        ein: update.ein ? update.ein : business.ein,
        ssn: update.ssn ? update.ssn : business.ssn,
        industry: update.industry ? update.industry : business.industry,
      },
    };
    return updateUser(businessDwollaId, u);
  } catch (error) {
    log(error);
    return { success: false, error };
  }
}

export async function updateCustomerProfile({
  customerDwollaId,
  update,
}: UpdateCustomerProfile): Promise<GenericDatabaseResponse<IDBUser>> {
  try {
    const response = await getUser(customerDwollaId);
    const { customer } = response?.data;
    const u = {
      customer: {
        ...customer,
        tag: update.tag,
      },
    };
    const updateResponse = await updateUser(customerDwollaId, u);
    return updateResponse;
  } catch (error) {
    log(error);
    return { success: false, error };
  }
}

export async function updateWalletAddress({
  walletAddress,
  dwollaId,
}: UpdateWalletAddress): Promise<GenericDatabaseResponse<IDBUser>> {
  try {
    const response = await getUser(dwollaId);
    let update;
    let filter;
    const { customer, business } = response?.data;
    const isCustomer = customer?.dwollaId === dwollaId;
    const isBusiness = business?.dwollaId === dwollaId;
    if (isCustomer) {
      update = { ...customer, "customer.walletAddress": walletAddress };
      filter = { "customer.dwollaId": dwollaId };
    } else if (isBusiness) {
      update = {
        ...business,
        owner: business.owner,
        "business.walletAddress": walletAddress,
      };
      filter = { "business.dwollaId": dwollaId };
    } else {
      return { success: false, error: "User not found!" };
    }
    return updateUser(dwollaId, update, filter);
  } catch (error) {
    log(error);
    return { success: false, error };
  }
}
