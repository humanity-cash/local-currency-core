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
  fileBody: Buffer
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
  fileBody: Buffer
): Promise<void> {
  await uploadFileToBucket(MERCHANTS_TX_REPORTS, filePath, fileBody);
}

/**AWS Token Middleware Verifier**/

const { JwtVerificationError, JwksNoMatchingKeyError } = errors;

export const cognitoVerifier = (): {
  verify: (token: string) => Promise<string>;
} =>
  verifierFactory({
    region: process.env.AWS_REGION,
    userPoolId: process.env.AWS_POOL_ID,
    appClientId: process.env.AWS_CLIENT_ID,
    tokenType: process.env.AWS_TOKEN_TYPE,
  });

export const verifyCognitoToken = async (
  token: string
): Promise<{ success: boolean; token: string }> => {
  try {
    const verifier = cognitoVerifier().verify;
    const verifiedToken = await verifier(token);

    return { success: true, token: verifiedToken };
  } catch (e) {
    if (
      e instanceof JwtVerificationError ||
      e instanceof JwksNoMatchingKeyError
    ) {
      return { success: false, token: token };
    }

    return { success: false, token: token };
  }
};
