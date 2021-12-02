import mongoose from "mongoose";
import { log } from "src/utils";

const startDatabase = (cb: () => void): void => {
  const databaseURL = process.env.MONGO_URL;
  if (!databaseURL) {
    log("Databse URL is not set. Aborting.");
    return;
  }
  log(`Connecting to databse ${databaseURL}`);
  mongoose.connect(databaseURL + "&authSource=admin", {
    auth: {
      user: process.env.MONGO_DB_USER,
      password: process.env.MONGO_DB_PASSWORD,
    },
    useNewUrlParser: true,
    useUnifiedTopology: true,
    tlsCAFile: `rds-combined-ca-bundle.pem`,
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
