import mongoose from "mongoose";

const LogSchema = new mongoose.Schema({
  timestamp: Number,
  message: String,
});

export default mongoose.model("Log", LogSchema);
