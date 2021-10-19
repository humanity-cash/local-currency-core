import "./aliases";
import startDatabase from "./database";
import { getApp } from "./server";
import { log } from "src/utils";
import { configureEnvironment } from "./utils/configuration";
import { registerWebhook } from "./service/digital-banking/DwollaWebhookService";

const app = getApp();

const runApp = async () => {

	if(process.env.NODE_ENV!="development"){
		await configureEnvironment();
		registerWebhook();
	}

	app.listen(process.env.PORT, () => {
		log(
			"NODE_ENV:",
			process.env.NODE_ENV,
			"\nLOCAL_CURRENCY_ADDRESS:",
			process.env.LOCAL_CURRENCY_ADDRESS,
			"\nLOCAL_CURRENCY_RPC_HOST:",
			process.env.LOCAL_CURRENCY_RPC_HOST,
			"\nLOCAL_CURRENCY_MNEMONIC set:",
			!!process.env.LOCAL_CURRENCY_MNEMONIC,
			"\nDERIVATION_PATH:",
			process.env.DERIVATION_PATH
		);
		log(`App listening at http://localhost:${process.env.PORT}`);
		startDatabase(() => {log("App with database started")});		
	});
}

runApp();
