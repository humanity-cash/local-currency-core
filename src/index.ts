import "./aliases";
import startDatabase from "./database";
import { getApp } from "./server";
import {
  isDwollaProduction,
  log,
  logSettings,
  shouldRegisterWebhook,
  shouldRunPromotionReconciliation,
  shouldRunTransferReconciliation,
  shouldSimulateBanking,
  shouldSimulateWebhook,
  shouldUseManagedSecrets,
} from "src/utils";
import { configureEnvironment } from "./utils/configuration";
import { registerWebhook } from "./service/digital-banking/DwollaWebhookService";
import { processDwollaSandboxSimulations } from "./test/utils";
import {
  reconcileDwollaDeposits,
  reconcileLinkedFundingSourceBonus,
} from "./service/digital-banking/DwollaService";

void (async function() {

  const app = getApp();
  
  if (shouldUseManagedSecrets()) {
    try{
      await configureEnvironment();
      log(`Environment configured`);
    }
    catch(err){
      log(`Error during secret configuration ${err}`);
    }
  }

  logSettings();

  if (shouldRegisterWebhook()) {
    if (shouldSimulateWebhook())
      throw Error(
        `Invalid configuration, REGISTER_WEBHOOK and SIMULATE_WEBHOOK cannot both be "true"`
      );
    try{
      const webhook = await registerWebhook();
      log(`Webhook registered ${webhook}`);
    }
    catch(err){
      log(`Error during registering webhook ${err}`);
    }
  }

  if (shouldSimulateBanking()) {
    if (isDwollaProduction())
      throw Error(
        `Invalid configuration, SIMULATE_BANKING cannot be used in Dwolla production environment`
      );

    setInterval(async () => {
      try{
        await processDwollaSandboxSimulations();
      }
      catch(err){
        log(`Error during processing Dwolla sandbox banking simulations ${err}`);
      }
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
    
    startDatabase(async (err) => {
      if (err) throw err;
      else log("App with database started");
    });
  });

  if (shouldRunTransferReconciliation()) {
    try{
      const success = await reconcileDwollaDeposits();
      log(`reconcileDwollaDeposits() executed with response ${success}`);
    }
    catch(err){
      log(`Error during deposit reconciliation ${err}`);
    }
  }

  if (shouldRunPromotionReconciliation()) {
    try{
      const success = await reconcileLinkedFundingSourceBonus();
      log(`reconcileLinkedFundingSourceBonus() executed with response ${success}`);
    }
    catch(err){
      log(`Error during linked bank account promotion reconciliation ${err}`);
    }
  }

})()