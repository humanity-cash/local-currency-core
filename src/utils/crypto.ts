/* eslint-disable @typescript-eslint/no-explicit-any */
import * as utils from "web3-utils";
import { BlockTransactionString } from "web3-eth";
import { getProvider } from "./getProvider";

export function toBytes32(input: string): string {
  return utils.keccak256(input);
}

export async function getTimestampForBlock(
  blockNumber: number
): Promise<string | number> {
  const provider = await getProvider();
  const block: BlockTransactionString = await provider.web3.eth.getBlock(
    blockNumber
  );
  return block.timestamp;
}
