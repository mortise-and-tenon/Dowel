// 阿里云翻译API调用示例
// 文档参考：https://help.aliyun.com/document_detail/158244.html

import { TauriAdapter } from "../utils";
import { TranslationInterface } from "./translationInferace";

const providerName = "aliyun";
const platformAdapter = new TauriAdapter();

export class AliTranslation implements TranslationInterface {
  translate = async (text: string, from: string, to: string) => {
    const config = await platformAdapter.readTranslation(providerName);

    if (config != undefined) {
      const api = config.api ? config.api : "https://mt.aliyuncs.com";
      const key = config.key ? config.key : "";
      const secret = config.secret ? config.secret : "";
      const result = this.translateWithKey(text, from, to, api, key, secret);
      await platformAdapter.refreshTokenUsed(providerName, text.length);
      return result;
    }

    throw new Error("translation.config.error");
  };

  /**
   * 调用阿里云翻译API
   * @param {string} text - 待翻译文本
   * @param {string} from - 源语言 (例如: 'zh' 中文, 'en' 英文)
   * @param {string} to - 目标语言
   * @param {string} accessKeyId - 阿里云AccessKey ID
   * @param {string} accessKeySecret - 阿里云AccessKey Secret
   * @returns {Promise<Object>} 翻译结果
   */
  translateWithKey = async (
    text: string,
    from: string,
    to: string,
    api: string,
    accessKeyId: string,
    accessKeySecret: string
  ) => {
    // 构建请求参数
    const params: Record<string, string> = {
      Action: "TranslateGeneral",
      Version: "2018-10-12",
      Format: "JSON",
      AccessKeyId: accessKeyId,
      SignatureNonce: Math.random().toString(36).substring(2, 12),
      Timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
      SignatureMethod: "HMAC-SHA1",
      SignatureVersion: "1.0",

      FormatType: "text",
      Scene: "general",
      SourceLanguage: from,
      TargetLanguage: to,
      SourceText: text,
    };

    // 生成签名
    params.Signature = this.generateSignature(
      accessKeyId,
      accessKeySecret,
      params
    );

    console.log("aliyun translate");

    // 构建请求URL
    const queryString = new URLSearchParams(params).toString();
    const url = `${api}?${queryString}`;

    try {
      // 发送请求
      const response = await fetch(url);
      const result = await response.json();

      if (result.Code != 200) {
        throw new Error(`API错误: ${result.Message} (${result.Code})`);
      }

      return {
        original: text,
        translated: result.Data.Translated,
        from,
        to,
      };
    } catch (error) {
      console.error("翻译请求失败:", error);
      throw error;
    }
  };

  /**
   * 生成阿里云API签名
   * @param {string} accessKeyId - 阿里云AccessKey ID
   * @param {string} accessKeySecret - 阿里云AccessKey Secret
   * @param {string} params - 请求参数
   * @returns {string} 签名结果
   */
  generateSignature = (
    accessKeyId: string,
    accessKeySecret: string,
    params: Record<string, string>
  ) => {
    // 排序参数
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((obj: Record<string, string>, key: string) => {
        obj[key] = params[key];
        return obj;
      }, {});

    // 拼接字符串
    let stringToSign =
      "GET" +
      "&" +
      encodeURIComponent("/") +
      "&" +
      encodeURIComponent(
        Object.keys(sortedParams)
          .map(
            (key) =>
              `${encodeURIComponent(key)}=${encodeURIComponent(
                sortedParams[key]
              )}`
          )
          .join("&")
      );

    // 计算签名
    const crypto = require("crypto");
    const hmac = crypto.createHmac("sha1", accessKeySecret + "&");
    hmac.update(stringToSign);
    return hmac.digest("base64");
  };
}
