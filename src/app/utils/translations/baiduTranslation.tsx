/**
 * 百度翻译API调用工具
 * 文档参考：https://fanyi-api.baidu.com/doc/21
 */

import { TauriAdapter } from "../utils";
import {
  requestGetTranslationHttp,
  TranslationInterface,
  TranslationResult,
} from "./translationInferace";

const providerName = "baidu";
const platformAdapter = new TauriAdapter();

export class BaiduTranslation implements TranslationInterface {
  translate = async (text: string, from: string, to: string) => {
    const config = await platformAdapter.readTranslation(providerName);

    if (config != undefined) {
      const api = config.api
        ? config.api
        : "https://fanyi-api.baidu.com/api/trans/vip/translate";
      const key = config.key ? config.key : "";
      const secret = config.secret ? config.secret : "";
      const result = this.translateWithKey(text, from, to, api, key, secret);
      await platformAdapter.refreshTokenUsed(providerName, text.length);
      return result;
    }

    throw new Error("translation.config.error");
  };
  translateWithKey = async (
    text: string,
    from: string,
    to: string,
    api: string,
    appid: string,
    key: string
  ) => {
    // 构建请求参数
    const salt = this.generateRandomString();
    const sign = this.md5(appid + text + salt + key);
    console.log("baidu translate");

    const params = new URLSearchParams({
      q: text,
      from,
      to,
      appid,
      salt,
      sign,
    });

    try {
      // 发送请求
      const response = await requestGetTranslationHttp(`${api}?${params}`);
      const result = JSON.parse(response.body);

      // 处理错误
      if (result.error_code) {
        throw new Error(
          `翻译失败: ${result.error_msg} (错误码: ${result.error_code})`
        );
      }

      // 整理返回结果
      return {
        original: text,
        translated: result.trans_result.map((item: any) => item.dst).join("\n"),
        from,
        to,
      };
    } catch (error) {
      console.error("翻译请求出错:", error);
      throw error;
    }
  };

  /**
   * 生成随机字符串
   * @param {number} length - 字符串长度
   * @returns {string} 随机字符串
   */
  generateRandomString = (length = 16) => {
    const chars = "0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  /**
   * 计算MD5哈希值
   * @param {string} str - 待加密字符串
   * @returns {string} MD5哈希值
   */
  md5 = (str: string) => {
    const crypto = require("crypto");
    return crypto.createHash("md5").update(str).digest("hex").toLowerCase();
  };
}
