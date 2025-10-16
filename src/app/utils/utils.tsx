import {
  BaseDirectory,
  exists,
  readTextFile,
  writeTextFile,
} from "@tauri-apps/plugin-fs";
import CryptoJS, { x64 } from "crypto-js";
import { invoke } from "@tauri-apps/api/core";

const SECRET_KEY = "Z39oqVCeeqKbz3x9SDuzQkoNqntALcdVjkPco5Gw6a4=";

const CONFIG_FILE_NAME = "dowel.json";

// 加密函数
export const encrypt = (text: string): string => {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

// 解密函数
export const decrypt = (ciphertext: string): string => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export type AppData = {};

export type ProviderData = {
  name: string;
  api?: string;
  key?: string;
  on?: boolean;
};

export type TranslationData = {
  name: string;
  api?: string;
  key?: string;
  secret?: string;
  on: boolean;
};

export type AiData = {
  name: string;
  provider: string;
  model: string;
  prompt: string;
  on: boolean;
};

export type ConfigFile = {
  app: AppData;
  providers: ProviderData[];
  translations: TranslationData[];
  ai: AiData[];
};

export interface PlatformAdapter {
  readConfigData(): Promise<ConfigFile>;
  writeAppData(appData: AppData): void;
  readAppData(): Promise<AppData>;
  writeProviderData(providerData: ProviderData): void;
  readProviders(): Promise<ProviderData[]>;
  writeTranslation(translationData: TranslationData): void;
  readTranslations(): Promise<TranslationData[]>;
  readTranslation(name: string): Promise<TranslationData | undefined>;
  writeAiData(aiData: AiData): void;
  readAiData(name: string): Promise<AiData | undefined>;
}

export class TauriAdapter implements PlatformAdapter {
  readConfigData = async () => {
    const fileExists = await exists(CONFIG_FILE_NAME, {
      baseDir: BaseDirectory.Home,
    });
    if (!fileExists) {
      return {};
    }

    const jsonContent = await readTextFile(CONFIG_FILE_NAME, {
      baseDir: BaseDirectory.Home,
    });

    return JSON.parse(jsonContent);
  };

  writeAppData = async (appData: AppData) => {
    const jsonContent: ConfigFile = await this.readConfigData();

    jsonContent.app = appData;

    await writeTextFile(
      CONFIG_FILE_NAME,
      JSON.stringify(jsonContent, null, 2),
      {
        baseDir: BaseDirectory.Home,
      }
    );
  };

  readAppData = async () => {
    const fileExists = await exists(CONFIG_FILE_NAME, {
      baseDir: BaseDirectory.Home,
    });
    if (!fileExists) {
      return {};
    }

    const jsonContent = await readTextFile(CONFIG_FILE_NAME, {
      baseDir: BaseDirectory.Home,
    });

    return JSON.parse(jsonContent).app;
  };

  writeProviderData = async (providerData: ProviderData) => {
    const jsonContent: ConfigFile = await this.readConfigData();

    // 查找是否存在同名供应商
    const existingIndex = jsonContent.hasOwnProperty("providers")
      ? jsonContent.providers.findIndex(
          (item) => item.name === providerData.name
        )
      : -2;

    if (existingIndex > -1) {
      // 存在同名供应商，替换原有数据
      const oldProvider = jsonContent.providers[existingIndex];
      console.log(providerData);
      jsonContent.providers[existingIndex] = {
        name: providerData.name,
        api: providerData.api ? providerData.api : oldProvider.api,
        key: providerData.key ? providerData.key : oldProvider.key,
        on: providerData.on != undefined ? providerData.on : oldProvider.on,
      };
    } else {
      // 不存在同名，添加新供应商
      if (jsonContent.providers == null || jsonContent.providers == undefined) {
        jsonContent.providers = [];
      }
      jsonContent.providers.push(providerData);
    }

    await writeTextFile(
      CONFIG_FILE_NAME,
      JSON.stringify(jsonContent, null, 2),
      {
        baseDir: BaseDirectory.Home,
      }
    );
  };

  readProviders = async () => {
    const fileExists = await exists(CONFIG_FILE_NAME, {
      baseDir: BaseDirectory.Home,
    });
    if (!fileExists) {
      return [];
    }

    const jsonContent = await readTextFile(CONFIG_FILE_NAME, {
      baseDir: BaseDirectory.Home,
    });

    return JSON.parse(jsonContent).providers;
  };

  writeTranslation = async (translationData: TranslationData) => {
    const jsonContent: ConfigFile = await this.readConfigData();

    // 查找是否存在同名配置
    const existingIndex = jsonContent.hasOwnProperty("translations")
      ? jsonContent.translations.findIndex(
          (item) => item.name === translationData.name
        )
      : -2;

    if (existingIndex > -1) {
      // 存在同名，替换原有数据
      const oldTranslation = jsonContent.translations[existingIndex];
      jsonContent.translations[existingIndex] = {
        name: translationData.name,
        api: translationData.api ? translationData.api : oldTranslation.api,
        key: translationData.key ? translationData.key : oldTranslation.key,
        secret:
          translationData.secret != undefined
            ? translationData.secret
            : oldTranslation.secret,
        on: translationData.on != undefined ? translationData.on : false,
      };
    } else {
      // 不存在同名配置，添加新配置
      if (
        jsonContent.translations == null ||
        jsonContent.translations == undefined
      ) {
        jsonContent.translations = [];
      }
      jsonContent.translations.push(translationData);
    }

    await writeTextFile(
      CONFIG_FILE_NAME,
      JSON.stringify(jsonContent, null, 2),
      {
        baseDir: BaseDirectory.Home,
      }
    );
  };

  readTranslations = async () => {
    const fileExists = await exists(CONFIG_FILE_NAME, {
      baseDir: BaseDirectory.Home,
    });
    if (!fileExists) {
      return [];
    }

    const jsonContent = await readTextFile(CONFIG_FILE_NAME, {
      baseDir: BaseDirectory.Home,
    });

    return JSON.parse(jsonContent).translations;
  };

  readTranslation = async (name: string) => {
    const datas: TranslationData[] = await this.readTranslations();
    if (datas && datas.length > 0) {
      return datas.find((item) => item.name === name);
    }
    return undefined;
  };

  writeAiData = async (aiData: AiData) => {
    const jsonContent: ConfigFile = await this.readConfigData();

    // 查找是否存在同名翻译配置
    const existingIndex = jsonContent.hasOwnProperty("ai")
      ? jsonContent.ai.findIndex((item) => item.name === aiData.name)
      : -2;

    if (existingIndex > -1) {
      // 存在同名，替换原有数据
      const oldAi = jsonContent.ai[existingIndex];
      jsonContent.ai[existingIndex] = {
        name: aiData.name,
        provider: aiData.provider ? aiData.provider : oldAi.provider,
        model: aiData.model ? aiData.model : oldAi.model,
        prompt: aiData.prompt ? aiData.prompt : oldAi.prompt,
        on: aiData.on != undefined ? aiData.on : false,
      };
    } else {
      // 不存在同名配置，添加新配置
      if (jsonContent.ai == null || jsonContent.ai == undefined) {
        jsonContent.ai = [];
      }
      jsonContent.ai.push(aiData);
    }

    await writeTextFile(
      CONFIG_FILE_NAME,
      JSON.stringify(jsonContent, null, 2),
      {
        baseDir: BaseDirectory.Home,
      }
    );
  };

  readAiDatas = async () => {
    const fileExists = await exists(CONFIG_FILE_NAME, {
      baseDir: BaseDirectory.Home,
    });
    if (!fileExists) {
      return [];
    }

    const jsonContent = await readTextFile(CONFIG_FILE_NAME, {
      baseDir: BaseDirectory.Home,
    });

    return JSON.parse(jsonContent).ai;
  };

  readAiData = async (name: string) => {
    const datas: AiData[] = await this.readAiDatas();
    if (datas && datas.length > 0) {
      return datas.find((item) => item.name === name);
    }
    return undefined;
  };
}

/**
 * 请求数据
 */
export interface RequestOptions {
  method: string;
  url: string;
  verify?: boolean;
  headers?: Record<string, string>;
  body?: string | undefined;
}

/**
 * 响应数据
 */
export interface ApiResponse {
  status: number;
  body: string;
  headers: Record<string, string>;
}

/**
 * 封装的 http 方法
 * @param options
 * @returns
 */
export const fetchHttp = async (options: RequestOptions) => {
  return await invoke<ApiResponse>(`make_request`, { options });
};
