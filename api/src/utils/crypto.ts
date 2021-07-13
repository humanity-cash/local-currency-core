/* eslint-disable @typescript-eslint/no-explicit-any */
import * as ed from "ed25519-supercop";
import * as utils from "web3-utils";

export function getEd25519KeyPair(seed?: string): any {
  let randomSeed;
  if (!seed) {
    randomSeed = ed.createSeed();
    console.log("Random seed is (hex) " + randomSeed.toString("hex"));
    console.log(
      "Random seed is (Buffer) " + JSON.stringify(randomSeed.toJSON())
    );
  } else {
    console.log("Passed in seed is (hex) " + seed);
  }

  const seedToUse = seed || randomSeed;
  console.log("Using " + seedToUse.toString("hex"));
  const keypair = ed.createKeyPair(seedToUse);
  console.log(
    "Public key is " + JSON.stringify(keypair.publicKey.toString("hex"))
  );
  return keypair;
}

export function signEd25519APIRequest(
  timestamp: number,
  method: string,
  requestPath: string,
  body: string,
  privateKey: string,
  publicKey: string
): string {
  const data = timestamp + method + requestPath + (body ? body : "");
  const signature = ed.sign(data, publicKey, privateKey);
  return signature.toString("hex");
}

export function toBytes32(input: string): string {
  return utils.keccak256(input);
}
