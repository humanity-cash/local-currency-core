import { errors, verifierFactory } from "@southlane/cognito-jwt-verifier";
import {
  S3Client,
  CreateBucketCommand,
  ListBucketsCommand,
  ListBucketsCommandInput,
  CreateBucketCommandInput,
  PutObjectCommand,
  PutObjectCommandInput,
  GetObjectCommand,
  GetObjectCommandInput,
  CreateBucketCommandOutput,
  ListBucketsCommandOutput,
  PutObjectCommandOutput,
  GetObjectCommandOutput,
} from "@aws-sdk/client-s3";
import {
  SESClient,
  SendTemplatedEmailCommand,
  SendTemplatedEmailCommandInput,
  SendTemplatedEmailCommandOutput,
  SESClientConfig,
} from "@aws-sdk/client-ses";
import { log } from "./utils";

/**AWS-S3 Client**/

const s3 = new S3Client({ region: "us-west-1" });

export async function listBuckets(): Promise<ListBucketsCommandOutput> {
  try {
    const input: ListBucketsCommandInput = {};
    const command = new ListBucketsCommand(input);
    const buckets = await s3.send(command);

    return buckets;
  } catch (error) {
    throw new Error(error);
  }
}

export async function createBucket(
  bucketName: string
): Promise<CreateBucketCommandOutput> {
  try {
    const input: CreateBucketCommandInput = {
      Bucket: bucketName,
    };
    const command = new CreateBucketCommand(input);
    const response = await s3.send(command);

    return response;
  } catch (error) {
    throw new Error(error);
  }
}

export async function uploadFileToBucket(
  bucketName: string,
  filePath: string,
  fileBody: Buffer | string
): Promise<PutObjectCommandOutput> {
  try {
    const input: PutObjectCommandInput = {
      Bucket: bucketName,
      Key: filePath,
      Body: fileBody,
      ContentType: "application/octet-stream",
      CacheControl: "public, max-age=86400",
      ContentEncoding: "base64",
      ACL: "public-read",
    };
    const command = new PutObjectCommand(input);
    const res = await s3.send(command);

    return res;
  } catch (error) {
    throw new Error(error);
  }
}

export async function getFileFromBucket(
  bucketName: string,
  fileName: string
): Promise<GetObjectCommandOutput> {
  try {
    const input: GetObjectCommandInput = {
      Bucket: bucketName,
      Key: fileName,
    };
    const command = new GetObjectCommand(input);
    const response = await s3.send(command);
    return response;
  } catch (error) {
    throw new Error(error);
  }
}

/**Merchants CSV Transaction Reports**/

export const MERCHANTS_TX_REPORTS = "merchants-tx-reports";

export async function uploadMerchantReportToS3(
  filePath: string,
  fileBody: Buffer | string
): Promise<void> {
  await uploadFileToBucket(MERCHANTS_TX_REPORTS, filePath, fileBody);
}

/**AWS Token Middleware Verifier**/

const { JwtVerificationError, JwksNoMatchingKeyError } = errors;

enum TokenType {
  Access = "access",
  Id = "id",
}

const cognitoTokenVerifier = verifierFactory({
  region: process.env.AWS_REGION,
  userPoolId: process.env.AWS_POOL_ID,
  appClientId: process.env.AWS_CLIENT_ID,
  tokenType: TokenType.Access,
});

export async function verifyCognitoToken(
  token: string
): Promise<{ success: boolean; token: string }> {
  try {
    const verifiedToken = await cognitoTokenVerifier.verify(token);

    return { success: true, token: verifiedToken };
  } catch (e) {
    if (
      e instanceof JwtVerificationError ||
      e instanceof JwksNoMatchingKeyError
    ) {
      return { success: false, token: token };
    } else {
      return { success: false, token: token };
    }
  }
}

export interface DepositEmailTemplate {
  amount: string;
  userId: string;
  transactionId: string;
  timestamp: string;
  randomness: string;
}

export interface WithdrawalEmailTemplate {
  amount: string;
  feeAmount: string;
  netAmount: string;
  userId: string;
  transactionId: string;
  timestamp: string;
  randomness: string;
}

export interface WelcomeEmailTemplate {
  randomness: string;
}

export async function sendTemplatedEmail(
  templateName: string,
  templateData:
    | DepositEmailTemplate
    | WithdrawalEmailTemplate
    | WelcomeEmailTemplate,
  destinationAddress: string,
  sendFrom = "notify@mail.berkshares.humanity.cash"
): Promise<boolean> {
  try {
    const config: SESClientConfig = {
      apiVersion: "2010-12-01",
      region: "us-east-1",
    };
    const ses: SESClient = new SESClient(config);
    const input: SendTemplatedEmailCommandInput = {
      Source: sendFrom,
      Destination: {
        ToAddresses: [destinationAddress],
        // BccAddresses: ["tech@humanity.cash"]
      },
      Template: templateName,
      TemplateData: JSON.stringify(templateData),
      ReplyToAddresses: ["info@berkshares.org"],
    };
    const command: SendTemplatedEmailCommand = new SendTemplatedEmailCommand(
      input
    );
    log(`SendTemplatedEmailCommand ${JSON.stringify(command, null, 2)}`);

    const response: SendTemplatedEmailCommandOutput = await ses.send(command);
    log(`SendTemplatedEmailCommandOutput ${JSON.stringify(response, null, 2)}`);

    return true;
  } catch (err) {
    log(err);
    return false;
  }
}
