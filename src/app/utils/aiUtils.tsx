import { fetchHttp, RequestOptions } from "./utils";

const requestAiHttp = async (
  method: string,
  api: string,
  key: string,
  body?: any
) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${key}`,
  };

  const req: RequestOptions = {
    method: method,
    url: api,
    headers: headers,
  };

  return await fetchHttp(req);
};

const getHttp = async (api: string, key: string) => {
  return requestAiHttp("GET", api, key);
};

const postHttp = async (api: string, key: string, body?: any) => {
  return requestAiHttp("POST", api, key, body);
};

const putHttp = async (api: string, key: string, body?: any) => {
  return requestAiHttp("PUT", api, key, body);
};

const patchHttp = async (api: string, key: string, body?: any) => {
  return requestAiHttp("PATCH", api, key, body);
};

export class AiUtils {
  getModels = async (api: string, key: string) => {
    const url = `${api}/v1/models`;
    try {
      const response = await getHttp(url, key);
      console.log(response);
      if (response.status == 200) {
        return {
          success: true,
          data: JSON.parse(response.body),
          msg: "http.ai.success",
        };
      } else if (response.status == 401) {
        return { success: false, msg: "http.ai.auth_error" };
      } else {
        return { success: false, msg: "http.ai.models_error" };
      }
    } catch (error) {
      console.log("ai get models:", error);
      throw new Error("400");
    }
  };
}
