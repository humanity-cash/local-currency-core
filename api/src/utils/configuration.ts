import * as AWS from "aws-sdk";

function getSecrets(secretName:string, region:string) : string {

    let secret:string, decodedBinarySecret:string;

    const client = new AWS.SecretsManager({
        region: region
    });

    client.getSecretValue({SecretId: secretName}, (err, data) => {
        if (err) {
            if (err.code === 'DecryptionFailureException')
                // Secrets Manager can't decrypt the protected secret text using the provided KMS key.
                // Deal with the exception here, and/or rethrow at your discretion.
                throw err;
            else if (err.code === 'InternalServiceErrorException')
                // An error occurred on the server side.
                // Deal with the exception here, and/or rethrow at your discretion.
                throw err;
            else if (err.code === 'InvalidParameterException')
                // You provided an invalid value for a parameter.
                // Deal with the exception here, and/or rethrow at your discretion.
                throw err;
            else if (err.code === 'InvalidRequestException')
                // You provided a parameter value that is not valid for the current state of the resource.
                // Deal with the exception here, and/or rethrow at your discretion.
                throw err;
            else if (err.code === 'ResourceNotFoundException')
                // We can't find the resource that you asked for.
                // Deal with the exception here, and/or rethrow at your discretion.
                throw err;
        }
        else {
            // Decrypts secret using the associated KMS CMK.
            // Depending on whether the secret is a string or binary, one of these fields will be populated.
            if ('SecretString' in data) {
                secret = data.SecretString;
            } else {
                const buff = Buffer.from(data.SecretBinary.toString(), 'base64');
                decodedBinarySecret = buff.toString('ascii');
            }
        }
    });

    return secret || decodedBinarySecret;
}


export function configureEnvironment() : void {
    
    const secrets = getSecrets(process.env.SECRET_NAME, process.env.REGION);
    const secretsParsed = JSON.parse(secrets);

    const configurationItems : string[] = [
        "DEBUG", 
        "NODE_ENV", 
        "PORT", 
        "LOCAL_CURRENCY_RPC_HOST",
        "LOCAL_CURRENCY_ADDRESS", 
        "NUMBER_OPERATORS", 
        "DWOLLA_BASE_URL", 
        "DWOLLA_APP_KEY", 
        "DWOLLA_APP_SECRET",
        "DWOLLA_ENVIRONMENT", 
        "WEBHOOK_SECRET"
    ];

    configurationItems.forEach(element => {
        process.env[element] = secretsParsed[element];
    });
}