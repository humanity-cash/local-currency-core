import mongoose from "mongoose";

const DwollaDepositSchema = new mongoose.Schema({
  id: String,
  userId: String,
  operatorId: String,
  fundingSource: String,
  fundingTarget: String,
  amount: String,
  type: String,
  status: String,
  created: Number,
  updated: Number,
});

export default mongoose.model("DwollaDeposit", DwollaDepositSchema);
