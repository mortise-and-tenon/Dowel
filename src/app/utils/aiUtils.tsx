import { TranslateUtils } from "./translateUtils";
import { User_Msg_Format } from "./translations/translationInferace";
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

const translateUtils = new TranslateUtils();

// 定义流式请求的配置参数类型
interface StreamAiOptions {
  target: string;
  message: string;
  ai_name: string;
  /** 接收流式数据的回调（每次返回增量内容） */
  onChunk: (content: string) => void;
  /** 流式完成的回调 */
  onComplete: () => void;
  /** 错误处理回调 */
  onError: (error: Error) => void;
  /** 可选：AI 模型名称 */
}

// 定义 AI 流式响应中单个块的类型（根据实际 API 调整）
interface AiStreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    delta: {
      content?: string;
    };
    finish_reason: string | null;
    index: number;
  }>;
}

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
  singleCompletions = async (
    aiName: string,
    message: string,
    type?: string
  ) => {
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

  /**
   * 严格类型化的 AI 流式请求工具函数
   * @param options 流式请求配置
   * @returns 用于停止流的函数
   */
  singleStreamCompletions = async (options: StreamAiOptions) => {
    const { target, message, onChunk, onComplete, onError } = options;

    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
    let isStopped = false;

    const aiData = await adapter.readAiData(options.ai_name);
    if (!aiData) {
      onError(new Error("http.ai.config_not_found"));
      return;
    }

    const provider = await adapter.readProvider(aiData.provider);
    if (!provider) {
      onError(new Error("http.ai.config_not_found"));
      return;
    }

    if (!provider.api || !provider.key) {
      onError(new Error("http.ai.config_not_found"));
      return;
    }

    let content = await translateUtils.requestContent(message);

    content = User_Msg_Format.replace("$target_txt", target).replace(
      "$original_txt",
      content
    );

    if (content === "") {
      onError(new Error("http.ai.config_not_found"));
      return;
    }

    // 初始化流式请求
    const initStream = async () => {
      const url = `${provider.api}/v1/chat/completions`;
      try {
        // 发起请求（通过 API 路由转发，避免客户端暴露密钥）
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${provider.key}`,
          },
          body: JSON.stringify({
            model: aiData.model,
            messages: [
              { role: "system", content: aiData.web_prompt },
              { role: "user", content: content },
            ],
            stream: true,
          }),
        });

        // 严格检查响应状态和 body
        if (!response.ok) {
          throw new Error(
            `API 响应错误: ${response.status} ${response.statusText}`
          );
        }
        if (!response.body) {
          throw new Error("API 未返回流式响应 body");
        }

        // 获取 reader 并标记类型
        reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let done = false;

        // 循环读取流数据
        while (!done && !isStopped) {
          // 严格类型断言：确保 value 是 Uint8Array
          const { value, done: doneReading } = (await reader.read()) as {
            value: Uint8Array | undefined;
            done: boolean;
          };

          done = doneReading;

          if (value && !isStopped) {
            // 解码二进制数据为文本
            const chunkText = decoder.decode(value, { stream: true });
            // 按行分割 SSE 格式的响应（每行一个 JSON 块）
            const lines = chunkText
              .split("\n")
              .filter((line) => line.trim() !== "");

            for (const line of lines) {
              // 移除 SSE 前缀 "data: "
              const data = line.replace(/^data: /, "").trim();

              if (data === "[DONE]") {
                done = true;
                break;
              }

              try {
                // 严格解析为 AiStreamChunk 类型
                const parsedChunk: AiStreamChunk = JSON.parse(data);
                // 提取 delta.content（严格检查嵌套属性）
                const content = parsedChunk.choices?.[0]?.delta?.content;
                const finishReason = parsedChunk.choices?.[0]?.finish_reason;

                // 传递有效内容
                if (content && typeof content === "string") {
                  onChunk(content);
                }

                // 检查停止标志
                if (finishReason === "stop") {
                  done = true;
                  break;
                }
              } catch (parseError) {
                console.error(
                  "解析流式响应失败:",
                  parseError,
                  "原始数据:",
                  data
                );
              }
            }
          }
        }

        // 正常完成且未被主动停止
        if (!isStopped) {
          onComplete();
        }
      } catch (error) {
        // 仅在未主动停止时触发错误回调
        if (!isStopped) {
          onError(error instanceof Error ? error : new Error(String(error)));
        }
      } finally {
        // 清理 reader
        if (reader && !isStopped) {
          await reader.cancel().catch((cancelErr) => {
            console.error("流取消失败:", cancelErr);
          });
        }
        reader = null;
      }
    };

    // 启动流
    initStream();

    // 返回停止函数（严格类型：无参数，无返回值）
    return () => {
      if (!isStopped) {
        isStopped = true;
        // 取消 reader（如果存在）
        if (reader) {
          reader.cancel("用户主动停止").catch((cancelErr) => {
            console.error("停止流失败:", cancelErr);
          });
          reader = null;
        }
      }
    };
  };
}
