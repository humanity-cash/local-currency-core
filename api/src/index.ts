
import "./aliases";
import startDatabase from "./database";
import { getApp } from "./server";
import { log } from "src/utils";

const PORT = process.env.PORT || 3000;
const app = getApp();

const runApp = () => {
	app.listen(PORT, () => {
		log(
			"NODE_ENV:",
			process.env.NODE_ENV,
			"\nLOCAL_CURRENCY_ADDRESS:",
			process.env.LOCAL_CURRENCY_ADDRESS,
			"\nLOCAL_CURRENCY_RPC_HOST:",
			process.env.LOCAL_CURRENCY_RPC_HOST,
			"\nLOCAL_CURRENCY_MNEMONIC set:",
			!!process.env.LOCAL_CURRENCY_MNEMONIC
		);
		log(`App listening at http://localhost:${PORT}`);
		startDatabase(() => {log(`App started with database at ${process.env.MONGO_URL}`)});
	});
}

runApp();
