import dotenv from "dotenv";
import * as crypto from "../../utils/crypto";
import * as axios from "axios";
import {
  quoteRequest,
  quoteResponse,
  acceptQuote,
  quoteAccepted,
} from "./AnchorageTypes";

const result = dotenv.config();
if (result.error) {
  throw result.error;
}

const API_HOST = process.env.ANCHORAGE_API;
const API_VERSION = process.env.ANCHORAGE_API_VERSION;
const API_ACCESS_KEY = process.env.ANCHORAGE_API_KEY;
const TIMEOUT = 10000;

export function createHeadersForRequest(
  method: "GET" | "POST" | "DELETE",
  path: string,
  body: quoteRequest | acceptQuote
): any {
  const keyPair = crypto.getEd25519KeyPair(process.env.ED25519_SEED);
  const timestamp = Math.floor(Date.now() / 1000);
  const stringifiedBody = JSON.stringify(body);
  const signature = crypto.signEd25519APIRequest(
    timestamp,
    method,
    path,
    stringifiedBody,
    keyPair.secretKey,
    keyPair.publicKey
  );
  const headers = {
    "Content-Type": "application/json;charset=utf-8",
    "Api-Signature": `${signature}`,
    "Api-Timestamp": `${timestamp}`,
    "Api-Access-Key": `${API_ACCESS_KEY}`,
  };
  return headers;
}

export function createInstance(
  method: "GET" | "POST" | "DELETE",
  path: string,
  body?: quoteRequest | acceptQuote
): axios.AxiosInstance {
  const headers = createHeadersForRequest(method, path, body);
  const instance: axios.AxiosInstance = axios.default.create({
    baseURL: API_HOST,
    timeout: TIMEOUT,
    headers: headers,
  });
  return instance;
}

export async function getVaults(): Promise<any> {
  const path: string = API_VERSION + "/vaults";
  try {
    const instance = createInstance("GET", path);
    const response = await instance.get(path);
    return response.data;
  } catch (e) {
    console.log("getVaults failed");
    console.error(e);
    throw e;
  }
}

export async function getQuote(cUSDToSell: number): Promise<quoteResponse> {
  const path: string = API_VERSION + "/trading/quote";
  const request: quoteRequest = {
    tradingPair: "CUSD-USD",
    side: "SELL",
    quantity: cUSDToSell,
    currency: "cUSD",
  };

  try {
    const instance = createInstance("POST", path, request);
    const response = await instance.post(path);
    return response.data;
  } catch (e) {
    console.log("getQuote failed");
    console.error(e);
    throw e;
  }
}

export async function acceptQuote(accept: acceptQuote): Promise<quoteAccepted> {
  const path: string = API_VERSION + "/trading/quote/accept";

  try {
    const instance = createInstance("POST", path, accept);
    const response = await instance.post(path);
    return response.data;
  } catch (e) {
    console.log("acceptQuote failed");
    console.error(e);
    throw e;
  }
}

export async function sell(cUSDToSell: number): Promise<quoteAccepted> {
  try {
    const quote: quoteResponse = await getQuote(cUSDToSell);
    const accept: acceptQuote = {
      quoteID: quote.data.quoteID,
      side: "SELL",
    };
    const acceptance: quoteAccepted = await acceptQuote(accept);
    return acceptance;
  } catch (e) {
    console.log("Sell of " + cUSDToSell + "cUSD failed");
    console.error(e);
    throw e;
  }
}
