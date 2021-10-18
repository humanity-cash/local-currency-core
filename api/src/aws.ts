
import { errors, verifierFactory } from '@southlane/cognito-jwt-verifier';
import AWS from 'aws-sdk';
import { Key } from 'aws-sdk/clients/iot';
import { Body, BucketName } from 'aws-sdk/clients/s3';

AWS.config.update({
  region: 'us-west-1', accessKeyId: process.env.AWS_ACCESS_KEY
,secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY });

const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

export async function listBuckets(): Promise<void> {
  await s3.listBuckets(function (err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      return data.Buckets;
    }
  });

}

export async function createBucket(name: string): Promise<void> {
  const bucketParams = {
    Bucket: name 
  };
  await s3.createBucket(bucketParams, function (err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data.Location);
    }
  });
}

export async function uploadFileToBukcet(bucketName: BucketName, filePath: Key, fileBody: Body ): Promise<void> {
  const params = {
    Bucket: bucketName,
    Key: filePath,
    Body: fileBody,
    ContentType: 'application/octet-stream',
    CacheControl: 'public, max-age=86400'
  }

  await s3.putObject(params, function (err, data) {
    if (err) {
      console.log("Error in upload", err);
    }
    if (data) {
      console.log("Upload Success", data);
    }
  });
}

const MERCHANTS_TX_REPORTS = "merchants-tx-reports";

export async function uploadMerchantReportToS3(filePath: Key, fileBody: Body): Promise<void> { 
  await uploadFileToBukcet(MERCHANTS_TX_REPORTS, filePath, fileBody);
}

const { JwtVerificationError, JwksNoMatchingKeyError } = errors;

export const cognitoVerifier = () => verifierFactory({
  region: process.env.AWS_REGION,
  userPoolId: process.env.AWS_POOL_ID,
  appClientId: process.env.AWS_CLIENT_ID,
  tokenType: process.env.AWS_TOKEN_TYPE
});

export const verifyCognitoToken = async (token: string): Promise<{ success: boolean, token: any }> => {
  try {
		const verifier = cognitoVerifier().verify
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
