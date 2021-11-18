import mongoose from "mongoose";
import { log } from "src/utils";

// mongoose.connect('mongodb://username:password@host:port/database?options...', {useNewUrlParser: true});
// cb(callback) input will be executed after database started
const startDatabase = (cb: () => void): void => {
  const databaseURL = process.env.MONGO_URL;
  if (!databaseURL) {
    log("Databse URL is not set. Aborting.");

    return;
  }
  log(`Connecting to databse ${databaseURL}`);
  mongoose.connect(databaseURL + '?authSource=admin', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const db = mongoose.connection;
  db.on("err", (error: unknown) => {
    log(`Error running MongoDB: ${error}`);
  });
  db.once("open", () => {
    log("Started mongodb");
    cb();
  });
};

export default startDatabase;
