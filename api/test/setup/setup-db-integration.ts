import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

jest.setTimeout(30000);

beforeAll(async (): Promise<void> => {
  await mockDatabase.init();
});

beforeEach(async (): Promise<void> => {
  if (mockDatabase.isConnectionOpen()) return;
  await mockDatabase.openNewMongooseConnection();
});

afterEach(async (): Promise<void> => {
  try {
    await mockDatabase.dropDatabase();
    await mockDatabase.closeMongooseConnection();
  } catch (err) {
    console.log(`Err in db: afterEach: ${err}`);
  }
});

afterAll(async (): Promise<void> => {
  await mockDatabase.stop();
});

const mockDatabase = {
  mongoServer: null,
  client: mongoose,

  init: async function (): Promise<void> {
    const newServer = await MongoMemoryServer.create();
    this.mongoServer = newServer;
  },

  dropTestDatabase: async function (): Promise<void> {
    await this.client.connection.db.dropDatabase();
  },

  stop: async function (): Promise<void> {
    this.mongoServer.stop();
  },

  dropDatabase: async function (): Promise<void> {
    await this.client.connection.db.dropDatabase();
  },

  openNewMongooseConnection: async function (): Promise<void> {
    try {
      const uri = this.mongoServer.getUri();
      console.log("Mongo Test URI", uri);
      await this.client.connect(uri, {
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
        useNewUrlParser: true,
      });
    } catch (err) {
      throw new Error(`Mongoose Failed to connect: ${err}`);
    }
  },

  closeMongooseConnection: async function (): Promise<void> {
    await this.client.disconnect();
  },

  isConnectionOpen: function (): boolean {
    return this.client.connection.readyState !== 0;
  },
};
