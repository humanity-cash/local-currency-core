
import { errors, verifierFactory } from '@southlane/cognito-jwt-verifier';

const { JwtVerificationError, JwksNoMatchingKeyError } = errors;

export const cognitoVerifier = verifierFactory({
  region: process.env.AWS_REGION || 'eu-west',
  userPoolId: process.env.AWS_POOL_ID || 'eu-west-1_Mynki1a6j',
  appClientId: process.env.AWS_CLIENT_ID || '72vn0vds8fibjrh19se81g0aot',
  tokenType: process.env.AWS_TOKEN_TYPE || 'access'
});

export const verifyCognitoToken = async (token: string): Promise<{ success: boolean, token: any }> => {
  try {
		console.log('verifying', token);
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