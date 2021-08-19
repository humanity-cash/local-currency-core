/// <reference types="jest" />

import * as crypto from "../src/utils/crypto";
import dotenv from "dotenv";
import path from "path";
import { describe, it, expect } from "@jest/globals";

const result = dotenv.config({
  path: path.resolve(process.cwd(), ".env.test"),
});

if (result.error) {
  throw result.error;
}

describe("Unit test utilities", () => {
  it("Should generate keccak256 hash", async () => {
    const bytes32 = crypto.toBytes32("Random data");
    expect(bytes32).toEqual(
      "0x6097c725d47ca0d33ff1df3436ec35592a1887c7a5f39ce022394c59346f42fe"
    );
  });
});
