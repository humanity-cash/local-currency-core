import { errors, verifierFactory } from "@southlane/cognito-jwt-verifier";
import AWS from "aws-sdk";
import { Key } from "aws-sdk/clients/iot";
import { Body, Buckets, BucketName } from "aws-sdk/clients/s3";
import { log } from "./utils";

AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

export async function listBuckets(): Promise<Buckets> {
  let buckets: Buckets = [];
  await s3.listBuckets(function (err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      buckets = data.Buckets;
    }
  });

  return buckets;
}

export async function createBucket(name: string): Promise<void> {
  const bucketParams = {
    Bucket: name,
  };
  await s3.createBucket(bucketParams, function (error, data) {
    if (error) {
      log(error);
    } else {
      log("Success", data.Location);
    }
  });
}

export async function uploadFileToBukcet(
  bucketName: BucketName,
  filePath: Key,
  fileBody: Body
): Promise<void> {
  const params = {
    Bucket: bucketName,
    Key: filePath,
    Body: fileBody,
    ContentType: "application/octet-stream",
    CacheControl: "public, max-age=86400",
  };

  await s3.putObject(params, function (err, data) {
    if (err) {
      console.log("Error in upload", err);
    }
    if (data) {
      console.log("Upload Success", data);
    }
  });
}

export async function getFileFromBukcet(
  bucketName: BucketName,
  fileName: Key
): Promise<Body> {
  return new Promise(function (success, reject) {
    s3.getObject({ Bucket: bucketName, Key: fileName }, function (error, data) {
      if (error) {
        reject(error);
      } else {
        const buffer: Body = data.Body;
        // const a = buffer.toString();
        success(buffer);
      }
    });
  });
}

export const MERCHANTS_TX_REPORTS = "merchants-tx-reports";

export async function uploadMerchantReportToS3(
  filePath: Key,
  fileBody: Body
): Promise<void> {
  await uploadFileToBukcet(MERCHANTS_TX_REPORTS, filePath, fileBody);
}

const { JwtVerificationError, JwksNoMatchingKeyError } = errors;

export const cognitoVerifier = () =>
  verifierFactory({
    region: process.env.AWS_REGION,
    userPoolId: process.env.AWS_POOL_ID,
    appClientId: process.env.AWS_CLIENT_ID,
    tokenType: process.env.AWS_TOKEN_TYPE,
  });

export const verifyCognitoToken = async (
  token: string
): Promise<{ success: boolean; token: any }> => {
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
