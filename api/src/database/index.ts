import mongoose from "mongoose";
import { log, shouldUseMongoTLS } from "src/utils";

const startDatabase = (cb: (err?) => void): void => {
  const databaseURL = process.env.MONGO_URL;
  if (!databaseURL) {
    log("Databse URL is not set. Aborting.");
    return;
  }
  log(`Connecting to databse ${databaseURL}`);

  if (shouldUseMongoTLS())
    mongoose.connect(databaseURL + "&authSource=admin", {
      auth: {
        user: process.env.MONGO_DB_USER,
        password: process.env.MONGO_DB_PASSWORD,
      },
      useCreateIndex: true,
      tls: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      tlsCAFile: "rds-combined-ca-bundle.pem",
    });
  else
    mongoose.connect(databaseURL + "&authSource=admin", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

  const db = mongoose.connection;
  db.on("err", (error: unknown) => {
    log(`Error running MongoDB: ${error}`);
    cb(error);
  });
  db.once("open", () => {
    log("Started mongodb");
    cb();
  });
};

export default startDatabase;
