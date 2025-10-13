import { fetchHttp, RequestOptions } from "../utils";

/**
 * 翻译结果
 */
export type TranslationResult = {
  original: string;
  translated: string;
  from: string;
  to: string;
};

/**
 * 翻译厂商接口
 */
export interface TranslationInterface {
  translate(text: string, from: string, to: string): Promise<TranslationResult>;
  translateWithKey(
    text: string,
    from: string,
    to: string,
    api: string,
    id: string,
    secret: string
  ): Promise<TranslationResult>;
}

export const requestGetTranslationHttp = async (api: string) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  const req: RequestOptions = {
    method: "GET",
    url: api,
    headers: headers,
  };

  return await fetchHttp(req);
};
