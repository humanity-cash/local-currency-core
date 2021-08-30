import { body, header } from "express-validator";

export const dwollaWebhook = [
  header(
    "X-Request-Signature-SHA-256",
    "Must supply X-Request-Signature-SHA-256 header"
  ),
  body("id", "Event payload must contain string 'id' attribute").isString(),
  body(
    "resourceId",
    "Event payload must contain string 'resourceId' attribute"
  ).isString(),
  body(
    "topic",
    "Event payload must contain string 'topic' attribute"
  ).isString(),
  body(
    "timestamp",
    "Event payload must contain string 'timestamp' attribute"
  ).isString(),
  body(
    "created",
    "Event payload must contain string 'created' attribute"
  ).isString(),
  body("_links", "Event payload must contain '_links' attribute").exists()
];
