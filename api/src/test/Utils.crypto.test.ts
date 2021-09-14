/// <reference types="jest" />

import * as crypto from "../utils/crypto";
import { describe, it, expect } from "@jest/globals";

describe("Unit test utilities", () => {
  it("Should generate keccak256 hash", async () => {
    const bytes32 = crypto.toBytes32("Random data");
    expect(bytes32).toEqual(
      "0x6097c725d47ca0d33ff1df3436ec35592a1887c7a5f39ce022394c59346f42fe"
    );
  });
});
