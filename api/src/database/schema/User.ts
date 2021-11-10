import mongoose from "mongoose";

export const BusinessSchema = new mongoose.Schema(
  {
    story: String,
    walletAddress: { type: String, unique: true, sparse: true },
    tag: String,
    avatar: String,
    type: String,
    rbn: { type: String, unique: true, sparse: true },
    industry: String,
    ein: { type: String, unique: true, sparse: true },
    address1: String,
    address2: String,
    city: String,
    state: String,
    postalCode: String,
    phoneNumber: String,
    dwollaId: { type: String, index: true, unique: true, sparse: true },
    resourceUri: String,
    owner: {
      firstName: String,
      lastName: String,
      address1: String,
      address2: String,
      city: String,
      state: String,
      postalCode: String,
    },
  },
  { _id: false }
);

export const BusinessModel = mongoose.model("Business", BusinessSchema);

export const CustomerSchema = new mongoose.Schema(
  {
    avatar: String,
    walletAddress: { type: String, unique: true, sparse: true },
    tag: String,
    address1: String,
    address2: String,
    city: String,
    state: String,
    postalCode: String,
    firstName: String,
    lastName: String,
    dwollaId: { type: String, index: true, unique: true, sparse: true },
    resourceUri: String,
  },
  { _id: false }
);

export const CustomerModel = mongoose.model("Customer", CustomerSchema);

const UserSchema = new mongoose.Schema(
  {
    consent: { type: Boolean, required: true },
    verifiedCustomer: { type: Boolean, required: true },
    verifiedBusiness: { type: Boolean, required: true },
    email: { type: String, unique: true, required: true },
    business: BusinessSchema,
    customer: CustomerSchema,
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
