/* eslint-disable @typescript-eslint/no-explicit-any */
import * as utils from "web3-utils";

export function toBytes32(input: string): string {
  return utils.keccak256(input);
}
