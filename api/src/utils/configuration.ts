import { SecretsManagerClient, GetSecretValueCommand, GetSecretValueCommandInput } from "@aws-sdk/client-secrets-manager";

async function getSecrets(secretName: string, region: string): Promise<string> {
  let secret: string, decodedBinarySecret: string;

  const client = new SecretsManagerClient({
    region: region,
  });

  const input: GetSecretValueCommandInput = {  
   SecretId: secretName,
  }
  const command = new GetSecretValueCommand(input);
  const data = await client
    .send(command)
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
    `Retrieving ${process.env.SECRET_NAME} from region ${process.env.REGION}`
  );

  const secrets = await getSecrets(process.env.SECRET_NAME, process.env.REGION);
  const secretsParsed = JSON.parse(secrets);
  console.log(secretsParsed);

  const configurationItems: string[] = [
    "DEBUG",
    "NODE_ENV",
    "PORT",
    "LOCAL_CURRENCY_RPC_HOST",
    "LOCAL_CURRENCY_ADDRESS",
    "LOCAL_CURRENCY_MNEMONIC",
    "DERIVATION_PATH",
    "NUMBER_OPERATORS",
    "OPERATOR_1_FUNDING_SOURCE",
    "OPERATOR_2_FUNDING_SOURCE",
    "AWS_REGION",
    "AWS_POOL_ID",
    "AWS_CLIENT_ID",
    "AWS_TOKEN_TYPE",
    "DWOLLA_BASE_URL",
    "DWOLLA_APP_KEY",
    "DWOLLA_APP_SECRET",
    "DWOLLA_ENVIRONMENT",
    "WEBHOOK_SECRET",
    "WEBHHOK_URL",
  ];

  configurationItems.forEach((element) => {
    process.env[element] = secretsParsed[element];
  });
}
