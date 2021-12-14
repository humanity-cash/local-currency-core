import mongoose from "mongoose";

const LaunchPromotionSchema = new mongoose.Schema({
  fingerprint: { type: String, unique: true, sparse: true },
  promotionAmount: String,
});

export default mongoose.model("LaunchPromotion", LaunchPromotionSchema);
