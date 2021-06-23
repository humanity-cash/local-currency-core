import dotenv from "dotenv";
dotenv.config();
import "./aliases";
import { getApp } from "./server";

const PORT = process.env.PORT || 3000;
const app = getApp();

const runServer = () => {
	app.listen(PORT, () => {
		console.log(
			"NODE_ENV:",
			process.env.NODE_ENV,
			"\nLOCAL_CURRENCY_ADDRESS:",
			process.env.LOCAL_CURRENCY_ADDRESS,
			"\nLOCAL_CURRENCY_ADDRESS:",
			process.env.LOCAL_CURRENCY_ADDRESS,
			"\nLOCAL_CURRENCY_MNEMONIC set:",
			!!process.env.LOCAL_CURRENCY_MNEMONIC
		);
		console.log(`App listening at http://localhost:${PORT}`);
	});
}

runServer();
