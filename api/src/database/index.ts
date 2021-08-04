import mongoose from "mongoose";

// mongoose.connect('mongodb://username:password@host:port/database?options...', {useNewUrlParser: true});
// cb(callback) input will be executed after database started
const startDatabase = (cb: () => void): void => {
  const databaseURL = process.env.MONGO_URL;
  if (!databaseURL) {
    console.log("Databse URL is not set. Aborting.");

    return;
  }
  console.log(`Connecting to databse ${databaseURL}`);
  mongoose.connect(databaseURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const db = mongoose.connection;
  db.on("err", (error: unknown) => {
    console.log(`Error running MongoDB: ${error}`);
  });
  db.once("open", () => {
    console.log("Started mongodb");
    cb();
  });
};

export default startDatabase;
