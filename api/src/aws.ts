
import { errors, verifierFactory } from '@southlane/cognito-jwt-verifier';

const { JwtVerificationError, JwksNoMatchingKeyError } = errors;

export const cognitoVerifier = verifierFactory({
  region: process.env.AWS_REGION,
  userPoolId: process.env.AWS_POOL_ID,
  appClientId: process.env.AWS_CLIENT_ID,
  tokenType: process.env.AWS_TOKEN_TYPE
});

export const verifyCognitoToken = async (token: string): Promise<{ success: boolean, token: any }> => {
  try {
    const verifiedToken = await cognitoVerifier.verify(token);

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