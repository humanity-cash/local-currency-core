import { errors, verifierFactory } from "@southlane/cognito-jwt-verifier";
import AWS, { AWSError } from "aws-sdk";
import { Key } from "aws-sdk/clients/iot";
import {
  Body,
  BucketName,
  PutObjectOutput,
  ListBucketsOutput,
  CreateBucketOutput,
  GetObjectOutput,
} from "aws-sdk/clients/s3";
import { PromiseResult } from "aws-sdk/lib/request";

/**AWS Client**/

AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

/**AWS-S3 Client**/

const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

export async function listBuckets(): Promise<
  PromiseResult<ListBucketsOutput, AWSError>
> {
  try {
    const buckets = await s3.listBuckets().promise();

    return buckets;
  } catch (error) {
    return error;
  }
}

export async function createBucket(
  bucketName: string
): Promise<PromiseResult<CreateBucketOutput, AWSError>> {
  try {
    const bucketParams = {
      Bucket: bucketName,
    };
    const response = await s3.createBucket(bucketParams).promise();

    return response;
  } catch (error) {
    return error;
  }
}

export async function uploadFileToBucket(
  bucketName: BucketName,
  filePath: Key,
  fileBody: Body
): Promise<PromiseResult<PutObjectOutput, AWSError>> {
  try {
    const params = {
      Bucket: bucketName,
      Key: filePath,
      Body: fileBody,
      ContentType: "application/octet-stream",
      CacheControl: "public, max-age=86400",
      ACL: 'public-read',
    };
    const res = await s3.putObject(params).promise();

    return res;
  } catch (error) {
    return error;
  }
}

export async function getFileFromBucket(
  bucketName: BucketName,
  fileName: Key
): Promise<PromiseResult<GetObjectOutput, Error>> {
  try {
    const response = await s3
      .getObject({ Bucket: bucketName, Key: fileName })
      .promise();
    return response;
  } catch (error) {
    return error;
  }
}

/**Merchants CSV Transaction Reports**/

export const MERCHANTS_TX_REPORTS = "merchants-tx-reports";

export async function uploadMerchantReportToS3(
  filePath: Key,
  fileBody: Body
): Promise<void> {
  await uploadFileToBucket(MERCHANTS_TX_REPORTS, filePath, fileBody);
}

/**AWS Token Middleware Verifier**/

const { JwtVerificationError, JwksNoMatchingKeyError } = errors;

export const cognitoVerifier = (): { verify:  (token: string) => Promise<string> } =>
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
