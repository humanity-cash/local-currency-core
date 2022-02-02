import mongoose from "mongoose";

const AppNotificationSchema = new mongoose.Schema({
  userId: String,
  timestamp: Number,
  message: String,
  closed: Boolean,
  level: String,
});

export default mongoose.model("AppNotification", AppNotificationSchema);
