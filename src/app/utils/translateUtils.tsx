import validator from "validator";
import { fetchHttp, RequestOptions } from "./utils";
import * as cheerio from "cheerio";
export class TranslateUtils {
  /**
   * 判断是否为 url
   * @param text
   * @returns
   */
  isUrl = (text: string): boolean => {
    return validator.isURL(text, {
      require_protocol: false,
      allow_underscores: true,
      allow_trailing_dot: false,
    });
  };

  requestUrl = async (url: string): Promise<string> => {
    const headers: HeadersInit = {
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    };

    const req: RequestOptions = {
      method: "GET",
      url: url,
      headers: headers,
      body: undefined,
    };

    const resp = await fetchHttp(req);

    if (resp.status == 200) {
      return resp.body;
    }
    return "";
  };

  parseTag = (content: string, selector: string) => {
    const $ = cheerio.load(content);
    const targetDiv = $(selector);

    const html = targetDiv.html();

    return html == null
      ? ""
      : html
          // 1. 转义双引号（JSON 字符串用双引号包裹，必须转义内部双引号）
          .replace(/"/g, '\\"')
          // 2. 转义反斜杠（避免被 JSON 解析为转义符）
          // 3. 转义控制字符（JSON 不允许未转义的控制字符）
          .replace(/\x00-\x1F/g, (char) => {
            // 映射控制字符到转义序列（如 \n、\t 等）
            const map: Record<string, string> = {
              "\b": "\b",
              "\f": "\f",
              "\n": "\n",
              "\r": "\r",
              "\t": "\t",
            };
            return map[char] || "";
          })
          // 4. 可选：移除多余空白（减少长度，不影响结构）
          .replace(/\s+/g, " ")
          .trim();
  };

  /**
   * 请求内容
   * @param url
   */
  requestContent = async (url: string): Promise<string> => {
    const html = await this.requestUrl(url);
    if (html === "") {
      return "";
    }
    const selector = 'div.book[lang="en"]';

    return this.parseTag(html, selector);
  };
}
