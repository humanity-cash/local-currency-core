import mongoose from "mongoose";

const DwollaEventSchema = new mongoose.Schema({
  eventId: String,
  created: String,
  topic: String,
  resourceId: String
});

export default mongoose.model("DwollaEvent", DwollaEventSchema);
