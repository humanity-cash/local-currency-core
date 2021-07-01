import { Request, Response } from "express";
import { consumeWebhook } from "src/service/digital-banking/Dwolla";
import { DwollaEvent } from "src/service/digital-banking/DwollaTypes";
import {
  validSignature,
  duplicateExists,
} from "src/service/digital-banking/DwollaUtils";
import { httpUtils } from "src/utils";

const codes = httpUtils.codes;
const PROCESSED = { message: "Processed" };
const NOT_PROCESSED = {
  message: "Event not processed, check server logs for more information",
};
const INVALID_SIGNATURE = { message: "Invalid signature" };
const IGNORED = { message: "Accepted but ignored (duplicate Event.id)" };

export async function dwollaWebhook(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    const webhookSecret = process.env.WEBHOOK_SECRET;

    if (
      !validSignature(_req.header.proposedSignature, webhookSecret, _req.body)
    ) {
      httpUtils.createHttpResponse(INVALID_SIGNATURE, codes.UNPROCESSABLE, res);
    } else if (duplicateExists(_req.body.id)) {
      httpUtils.createHttpResponse(IGNORED, codes.ACCEPTED, res);
    } else {
      const eventToProcess: DwollaEvent = {
        id: _req.body.id,
        resourceId: _req.body.resourceId,
        created: _req.body.created,
        topic: _req.body.topic,
        _links: _req.body._links,
      };
      const processed = await consumeWebhook(eventToProcess);

      if (processed) {
        httpUtils.createHttpResponse(PROCESSED, codes.ACCEPTED, res);
      } else {
        httpUtils.createHttpResponse(NOT_PROCESSED, codes.UNPROCESSABLE, res);
      }
    }
  } catch (err) {
    httpUtils.createHttpResponse(
      {
        message: "Server error: " + err,
      },
      codes.SERVER_ERROR,
      res
    );
  }
}
