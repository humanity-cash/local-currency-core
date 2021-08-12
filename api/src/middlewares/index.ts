/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import { validationResult } from "express-validator";
import { verifyCognitoToken } from "src/aws";

export const verifyRequest: express.RequestHandler = async (
  request: express.Request,
  response: express.Response,
  next: express.NextFunction
) => {
  const authHeader = request?.headers?.authorization;
  if (!authHeader) {
    console.log('No auth header in request');
    response.status(401).send({ err: 'No Auth Headers In Request' });
  } else {
   try {
    const verifyResponse = await verifyCognitoToken(authHeader);
    if (verifyResponse && verifyResponse.success) {
      /** Extract user Id from token
        const id = verifyResponse.token.username.replace('@', '-').replace('.', '-');
        request.userId = id;
        console.log(`Verified ${id} successfully`);
      */
      next();
    } else { response.status(401).send({ err: 'User is Unauthorized' }) };
    } catch (err) {
      console.log('Error in verifying', err);
      response.status(401).send({ err: 'User is Unauthorized' });
    }
  }
}

export const mwVaildator = (
  request: express.Request,
  response: express.Response,
  next: express.NextFunction
): any => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(400).json({ errors: errors.array() });
  }

  next();
};
