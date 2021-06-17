import dotenv from "dotenv";
dotenv.config();
import "./aliases";
import { getApp } from "./server";
import { startDatabase } from "./database";

const PORT = process.env.PORT || 3000;
const app = getApp();

const runApp = () => 
  app.listen(PORT, () => {
    console.log(
      "NODE_ENV:",
      process.env.NODE_ENV,
      "\nCELO_UBI_ADDRESS:",
      process.env.CELO_UBI_ADDRESS,
      "\nCELO_UBI_RPC_HOST:",
      process.env.CELO_UBI_RPC_HOST,
      "\nCELO_UBI_MNEMONIC set:",
      !!process.env.CELO_UBI_MNEMONIC
    );
    console.log(`App listening at http://localhost:${PORT}`);
  });

export const startServerWithDatabase = (): void => {
  startDatabase(runApp);
};

startServerWithDatabase();