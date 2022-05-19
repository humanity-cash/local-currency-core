import {
  SecretsManagerClient,
  GetSecretValueCommand,
  GetSecretValueCommandInput,
} from "@aws-sdk/client-secrets-manager";

async function getSecrets(secretName: string, region: string): Promise<string> {
  let secret: string, decodedBinarySecret: string;

  const client = new SecretsManagerClient({
    region: region,
  });

  const input: GetSecretValueCommandInput = {
    SecretId: secretName,
  };
  const command = new GetSecretValueCommand(input);
  const data = await client.send(command);
  if ("SecretString" in data) {
    secret = data.SecretString;
    console.log("Secrets are plaintext");
  } else {
    console.log("Secrets are binary");
    const buff = Buffer.from(data.SecretBinary.toString(), "base64");
    decodedBinarySecret = buff.toString("ascii");
  }
  return secret || decodedBinarySecret;
}

export async function configureEnvironment(): Promise<void> {
  console.log(
    `Retrieving ${process.env.SECRET_NAME} from region ${process.env.AWS_SECRET_REGION}`
  );

  const secrets = await getSecrets(process.env.SECRET_NAME, process.env.AWS_SECRET_REGION);
  const secretsParsed = JSON.parse(secrets);

  const configurationItems: string[] = [
    "DEBUG",
    "NODE_ENV",
    "PORT",
    
    "LOCAL_CURRENCY_RPC_HOST",
    "LOCAL_CURRENCY_ADDRESS",
    "LOCAL_CURRENCY_MNEMONIC",
    "LOCAL_CURRENCY_MNEMONIC_INDEX",

    "DWOLLA_BASE_URL",
    "DWOLLA_APP_KEY",
    "DWOLLA_APP_SECRET",
    "DWOLLA_ENVIRONMENT",
    "WEBHOOK_SECRET",
    "WEBHHOK_URL",

    "REGISTER_WEBHOOK",
    "SIMULATE_WEBHOOK",
    "SIMULATE_BANKING",
    "DELETE_PRIOR_WEBHOOK",

    "USE_MONGO_TLS",
    "MONGO_DB_USER",
    "MONGO_DB_PASSWORD",
    "MONGO_URL",

    "NUMBER_OPERATORS",
    "CUSTOMER_WITHDRAWAL_BALANCE_LIMIT",

    "OPERATOR_1_DWOLLA_USER_ID",
    "OPERATOR_1_MNEMONIC",
    "OPERATOR_1_MNEMONIC_INDEX",
    "OPERATOR_1_DISPLAY_NAME",
    "OPERATOR_1_FUNDING_SOURCE",

    "OPERATOR_2_DWOLLA_USER_ID",
    "OPERATOR_2_MNEMONIC",
    "OPERATOR_2_MNEMONIC_INDEX",
    "OPERATOR_2_DISPLAY_NAME",
    "OPERATOR_2_FUNDING_SOURCE",

    "AWS_REGION",
    "AWS_POOL_ID",
    "AWS_CLIENT_ID",
    "AWS_TOKEN_TYPE",

    "IMGIX_PROFILE_PICTURE_URL",
    "IMGIX_PURGE_API",
    "IMGIX_API_TOKEN",

    "TRANSFER_RECONCILE_ON_STARTUP",
    "PROMOTION_RECONCILE_ON_STARTUP"
  ];

  configurationItems.forEach((element) => {
    process.env[element] = secretsParsed[element];
  });
}