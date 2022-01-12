import axios from "axios";

/**ENV! */
// const CORE_API_URL = "https://alfajores.api.humanity.cash";
const CORE_API_URL = "https://staging.api.humanity.cash";
const httpRequest = axios.create({
  baseURL: CORE_API_URL,
});
type Query = string;
type Path = string;
type Body = {};

const _getRequest = (query: Query) => () => httpRequest.get(query);
const _postRequest = (path: Path, body: Body) => () =>
  httpRequest.post(path, body);

export const getRequest = (query: Query) => ErrorHandler(_getRequest(query));
export const postRequest = (path: Path, body: Body) =>
  ErrorHandler(_postRequest(path, body));

const ErrorHandler = async (requestHandler: Function) => {
  try {
    const response = await requestHandler();
    return response;
  } catch (err: any) {
    const readbleError = err?.toJSON().message;
    console.log(`Http Request Error: ${readbleError}`);
    return readbleError;
  }
};
