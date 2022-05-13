import axios, { AxiosInstance, AxiosResponse } from "axios";
import { log } from "../utils";

const TIMEOUT = 29000;
const HEADERS = {
  "Content-Type": "application/vnd.api+json",
  Authorization: "Bearer " + process.env.IMGIX_API_TOKEN,
};

function createAxiosInstance(): AxiosInstance {
  return axios.create({
    baseURL: process.env.IMGIX_PURGE_API,
    timeout: TIMEOUT,
    headers: HEADERS,
  });
}

export async function purgeImageForUser(userId: string): Promise<number> {
  log(`ExternalService::purgeImageForUser() started for userId ${userId}`);
  const purgePath = process.env.IMGIX_PURGE_API + "purge";
  log(`ExternalService::purgeImageForUser() purge API URL is ${purgePath}`);
  const userImageUrl = process.env.IMGIX_PROFILE_PICTURE_URL + userId + ".jpeg";
  log(
    `ExternalService::purgeImageForUser() purge image target URL is ${userImageUrl}`
  );

  const instance = createAxiosInstance();
  const body = JSON.stringify({
    data: {
      attributes: {
        url: userImageUrl,
      },
      type: "purges",
    },
  });
  const response: AxiosResponse = await instance.post(purgePath, body);
  log(
    `ExternalService::purgeImageForUser() response to purge request is ${
      response.status
    } with data ${JSON.stringify(response.data, null, 2)}`
  );
  return response.status;
}
