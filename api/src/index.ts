import "./aliases";
import startDatabase from "./database";
import { getApp } from "./server";
import { isProduction, isTest, log } from "src/utils";
import { configureEnvironment } from "./utils/configuration";
import { registerWebhook } from "./service/digital-banking/DwollaWebhookService";
import { processDwollaSandboxSimulations } from "./test/utils";

const app = getApp();

const runApp = async () => {

	if(isProduction()){
		await configureEnvironment();
	}
	if(!isTest()){
		await registerWebhook();
	}
	if(process.env.DWOLLA_ENVIRONMENT=="sandbox"){
		setInterval(async () => {
			await processDwollaSandboxSimulations();
		}, 60000);  	
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
