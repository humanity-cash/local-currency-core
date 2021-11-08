import mongoose from "mongoose";

const DwollaTransferSchema = new mongoose.Schema({
  fundingTransferId: String,
  fundingStatus: String,
  fundedTransferId: String,
  fundedStatus: String,
  userId: String,
  operatorId: String,
  fundingSource: String,
  fundingTarget: String,
  amount: String,
  type: String,
  created: Number,
  updated: Number,
});

export default mongoose.model("DwollaTransfer", DwollaTransferSchema);
