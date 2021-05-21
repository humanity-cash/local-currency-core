import assert from "assert";
import * as crypto from "../utils/crypto";
import * as utils from "../utils/utils";
import dotenv from "dotenv";

const result = dotenv.config();
if (result.error) {
  throw result.error;
}
function log(msg: string): void {
  if (process.env.DEBUG === "true") console.log(msg);
}

describe("Unit test crypto utilities", () => {
  it("Should generate a random ed25519 keypair", async () => {
    const keypair = crypto.getEd25519KeyPair();
    log(keypair);
    assert(keypair);
  });

  it("Should generate a known ed25519 keypair with seed", async () => {
    const keypair = crypto.getEd25519KeyPair(process.env.ED25519_SEED);
    assert.strictEqual(
      keypair.publicKey.toString("hex"),
      "df0d9f0733a1d00ab7fc5d31ea9431fa08391455f1278e1b013d2f85d98084c8"
    );
  });

  it("Should generate a known ed25519 keypair with seed", async () => {
    const keypair = crypto.getEd25519KeyPair(
      "0101010101010101010101010101010101010101010101010101010101010101"
    );
    assert.strictEqual(
      keypair.publicKey.toString("hex"),
      "8a88e3dd7409f195fd52db2d3cba5d72ca6709bf1d94121bf3748801b40f6f5c"
    );
  });

  it("Should generate Anchorage API reference signature", async () => {
    const timestamp = 1577880000;
    const method = "POST";
    const path = "/v2/transfers?foo=bar&baz=bang";
    const body =
      '{"sendingVaultId": "1c920f4241b78a1d483a29f3c24b6c4c", "assetType": "ETH", "destinationVaultId": "55e89d4a644d736b01533a2ea9b32a20", "amount": "1000.00000000"}';

    const seed =
      "0101010101010101010101010101010101010101010101010101010101010101";
    const keypair = crypto.getEd25519KeyPair(seed);

    const privateKey = keypair.secretKey;
    const publicKey = keypair.publicKey; //"8a88e3dd7409f195fd52db2d3cba5d72ca6709bf1d94121bf3748801b40f6f5c";

    const signature = crypto.signEd25519APIRequest(
      timestamp,
      method,
      path,
      body,
      privateKey,
      publicKey
    );
    log("Reference signature is " + signature);

    assert.strictEqual(
      signature,
      "ee430b8baab6164c4977fe45eddb8021a6dd52ea51c1e505f9d1e738332879dd64fd308091475fc2e07e13d867e17a4373c95fcbeafce4449622061e5bc94505"
    );
  });
});

describe("Unit test utilities", () => {
  it("Should generate keccak256 hash", async () => {
    const bytes32 = utils.toBytes32("Random data");
    assert(bytes32);
  });
});
