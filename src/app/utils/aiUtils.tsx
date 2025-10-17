import { fetchHttp, RequestOptions, TauriAdapter } from "./utils";

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
    body: body ? JSON.stringify(body) : undefined,
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

const adapter = new TauriAdapter();

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

  /**
   * 发起单次对话
   * @param aiName
   * @param message
   * @returns
   */
  singleCompletions = async (aiName: string, message: string) => {
    const aiData = await adapter.readAiData(aiName);
    if (!aiData) {
      return {
        success: false,
        data: null,
        msg: "http.ai.config_not_found",
      };
    }

    const provider = await adapter.readProvider(aiData.provider);
    if (!provider) {
      return {
        success: false,
        data: null,
        msg: "http.ai.config_not_found",
      };
    }

    if (!provider.api || !provider.key) {
      return {
        success: false,
        data: null,
        msg: "http.ai.config_not_found",
      };
    }

    return this.singleCompletionsWithKey(
      aiData.prompt,
      message,
      aiData.model,
      provider.api,
      provider.key
    );
  };

  singleCompletionsWithKey = async (
    prompt: string,
    message: string,
    model: string,
    api: string,
    key: string
  ) => {
    // 声明请求体结构
    const requestBody = {
      model,
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: message },
      ],
      stream: false,
    };

    const url = `${api}/v1/chat/completions`;
    try {
      const response = await postHttp(url, key, requestBody);
      console.log(response);
      const rawData = JSON.parse(response.body);

      if (response.status == 200) {
        if (!rawData.choices || !rawData.choices[0]?.message?.content) {
          return {
            success: false,
            data: null,
            msg: "http.ai.resp_error",
          };
        }
        return {
          success: true,
          data: rawData.choices[0].message.content,
          msg: "http.ai.success",
        };
      } else if (response.status == 401) {
        return { success: false, data: null, msg: "http.ai.auth_error" };
      } else {
        return { success: false, data: null, msg: "http.ai.data_error" };
      }
    } catch (error) {
      console.log("ai chat error:", error);
      throw new Error("400");
    }
  };
}
