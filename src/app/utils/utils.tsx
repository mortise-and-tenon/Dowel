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

export type AppData = {
  locale: string;
  showTray: boolean;
};

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
  limit?: number;
  used?: number;
  last_reset_month?: string;
  on: boolean;
};

export type TranslationConfig = {
  hotKey: string;
  locale: string;
};

export type AiData = {
  name: string;
  provider: string;
  model: string;
  prompt: string;
  web_prompt: string;
  web_mode: string;
  web_selector: string;
  on: boolean;
};

export type ConfigFile = {
  app: AppData;
  providers: ProviderData[];
  translations: TranslationData[];
  translationConfig: TranslationConfig;
  ai: AiData[];
};

export interface PlatformAdapter {
  readConfigFile(): Promise<ConfigFile>;
  writeAppData(appData: AppData): Promise<boolean>;
  readAppData(): Promise<AppData>;
  writeProviderData(providerData: ProviderData): Promise<boolean>;
  readProviders(): Promise<ProviderData[]>;
  readProvider(name: string): Promise<ProviderData | undefined>;
  writeTranslation(translationData: TranslationData): Promise<boolean>;
  resetTokenUsedMonth(): Promise<boolean>;
  refreshTokenUsed(name: string, used: number): Promise<boolean>;
  readTranslations(): Promise<TranslationData[]>;
  readTranslation(name: string): Promise<TranslationData | undefined>;
  writeTranslationConfig(
    translationConfig: TranslationConfig
  ): Promise<boolean>;
  readTranslationConfig(): Promise<TranslationConfig>;
  writeAiData(aiData: AiData): Promise<boolean>;
  readAiData(name: string): Promise<AiData | undefined>;
}

export class TauriAdapter implements PlatformAdapter {
  /**
   * 读取整个配置文件
   * @returns
   */
  readConfigFile = async (): Promise<ConfigFile> => {
    const fileExists = await exists(CONFIG_FILE_NAME, {
      baseDir: BaseDirectory.Home,
    });
    if (!fileExists) {
      return {
        app: {
          locale: "zh",
          showTray: true,
        },
        providers: [],
        translations: [],
        translationConfig: {
          hotKey: "",
          locale: "zh",
        },
        ai: [],
      };
    }

    const jsonContent = await readTextFile(CONFIG_FILE_NAME, {
      baseDir: BaseDirectory.Home,
    });

    return JSON.parse(jsonContent);
  };

  /**
   * 保存配置文件
   * @param configFile
   */
  writeConfigFile = async (configFile: ConfigFile) => {
    try {
      await writeTextFile(
        CONFIG_FILE_NAME,
        JSON.stringify(configFile, null, 2),
        {
          baseDir: BaseDirectory.Home,
        }
      );
      return true;
    } catch (error) {
      return false;
    }
  };

  /**
   * 写入 app 数据
   * @param appData
   */
  writeAppData = async (appData: AppData): Promise<boolean> => {
    const configFile = await this.readConfigFile();

    configFile.app = appData;

    try {
      await this.writeConfigFile(configFile);
      return true;
    } catch (error) {
      return false;
    }
  };

  /**
   * 读取 app 数据
   * @returns
   */
  readAppData = async (): Promise<AppData> => {
    const configFile = await this.readConfigFile();
    return configFile.app;
  };

  /**
   * 写入供应商数据
   * @param providerData
   */
  writeProviderData = async (providerData: ProviderData): Promise<boolean> => {
    const configFile = await this.readConfigFile();

    // 查找是否存在同名供应商
    const existingIndex = configFile.hasOwnProperty("providers")
      ? configFile.providers.findIndex(
          (item) => item.name === providerData.name
        )
      : -2;

    if (existingIndex > -1) {
      // 存在同名供应商，替换原有数据
      const oldProvider = configFile.providers[existingIndex];
      configFile.providers[existingIndex] = {
        name: providerData.name,
        api: providerData.api ? providerData.api : oldProvider.api,
        key: providerData.key ? providerData.key : oldProvider.key,
        on: providerData.on != undefined ? providerData.on : oldProvider.on,
      };
    } else {
      // 不存在同名，添加新供应商
      if (configFile.providers == null || configFile.providers == undefined) {
        configFile.providers = [];
      }
      configFile.providers.push(providerData);
    }

    return await this.writeConfigFile(configFile);
  };

  /**
   * 读取供应商数据
   * @returns
   */
  readProviders = async (): Promise<ProviderData[]> => {
    const configFile = await this.readConfigFile();
    return configFile.providers;
  };

  /**
   * 读取指定的供应商数据
   * @param name
   * @returns
   */
  readProvider = async (name: string): Promise<ProviderData | undefined> => {
    const datas = await this.readProviders();
    if (datas && datas.length > 0) {
      return datas.find((item) => item.name === name);
    }
    return undefined;
  };

  /**
   * 写入翻译厂商配置
   * @param translationData
   */
  writeTranslation = async (
    translationData: TranslationData
  ): Promise<boolean> => {
    const configFile = await this.readConfigFile();

    // 查找是否存在同名配置
    const existingIndex = configFile.hasOwnProperty("translations")
      ? configFile.translations.findIndex(
          (item) => item.name === translationData.name
        )
      : -2;

    if (existingIndex > -1) {
      // 存在同名，替换原有数据
      const oldTranslation = configFile.translations[existingIndex];
      configFile.translations[existingIndex] = {
        name: translationData.name,
        api: translationData.api ? translationData.api : oldTranslation.api,
        key: translationData.key ? translationData.key : oldTranslation.key,
        secret:
          translationData.secret != undefined
            ? translationData.secret
            : oldTranslation.secret,
        limit: translationData.limit
          ? translationData.limit
          : oldTranslation.limit,
        used: translationData.used ? translationData.used : oldTranslation.used,
        last_reset_month: translationData.last_reset_month
          ? translationData.last_reset_month
          : oldTranslation.last_reset_month,
        on: translationData.on != undefined ? translationData.on : false,
      };
    } else {
      // 不存在同名配置，添加新配置
      if (
        configFile.translations == null ||
        configFile.translations == undefined
      ) {
        configFile.translations = [];
      }
      configFile.translations.push(translationData);
    }

    return await this.writeConfigFile(configFile);
  };

  resetTokenUsedMonth = async (): Promise<boolean> => {
    const configFile = await this.readConfigFile();

    configFile.translations = configFile.translations.map((item) => {
      const newMonth = this.getCurrentMonthKey();
      const reset = !item.last_reset_month || item.last_reset_month != newMonth;

      return {
        ...item,
        used: reset ? 0 : item.used,
        last_reset_month: reset ? newMonth : item.last_reset_month,
      };
    });

    return await this.writeConfigFile(configFile);
  };

  refreshTokenUsed = async (name: string, used: number): Promise<boolean> => {
    const configFile = await this.readConfigFile();

    // 查找是否存在同名配置
    const existingIndex = configFile.hasOwnProperty("translations")
      ? configFile.translations.findIndex((item) => item.name === name)
      : -2;
    const newMonth = this.getCurrentMonthKey();
    if (existingIndex > -1) {
      // 存在同名，替换原有数据
      const oldTranslation = configFile.translations[existingIndex];
      configFile.translations[existingIndex] = {
        ...oldTranslation,
        used: (oldTranslation.used ? oldTranslation.used : 0) + used,
      };

      return await this.writeConfigFile(configFile);
    } else {
      return false;
    }
  };

  getCurrentMonthKey = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0"); // 月份 0-11 → 补0为两位数
    return `${year}${month}`;
  };

  /**
   * 读取翻译厂商配置
   * @returns
   */
  readTranslations = async (): Promise<TranslationData[]> => {
    const configFile = await this.readConfigFile();
    return configFile.translations;
  };

  /**
   * 读取指定的翻译厂商配置
   * @param name
   * @returns
   */
  readTranslation = async (name: string) => {
    const datas: TranslationData[] = await this.readTranslations();
    if (datas && datas.length > 0) {
      return datas.find((item) => item.name === name);
    }
    return undefined;
  };

  writeTranslationConfig = async (
    translationConfig: TranslationConfig
  ): Promise<boolean> => {
    const configFile = await this.readConfigFile();
    configFile.translationConfig = translationConfig;
    return await this.writeConfigFile(configFile);
  };

  readTranslationConfig = async (): Promise<TranslationConfig> => {
    const configFile = await this.readConfigFile();
    if (!configFile.translationConfig) {
      return {
        locale: "zh",
        hotKey: "",
      };
    }

    return configFile.translationConfig;
  };

  /**
   * 写入 ai 配置数据
   * @param aiData
   */
  writeAiData = async (aiData: AiData): Promise<boolean> => {
    const configFile = await this.readConfigFile();

    // 查找是否存在同名配置
    const existingIndex = configFile.hasOwnProperty("ai")
      ? configFile.ai.findIndex((item) => item.name === aiData.name)
      : -2;

    if (existingIndex > -1) {
      // 存在同名，替换原有数据
      const oldAi = configFile.ai[existingIndex];
      configFile.ai[existingIndex] = {
        name: aiData.name,
        provider: aiData.provider ? aiData.provider : oldAi.provider,
        model: aiData.model ? aiData.model : oldAi.model,
        prompt: aiData.prompt ? aiData.prompt : oldAi.prompt,
        web_prompt: aiData.web_prompt ? aiData.web_prompt : oldAi.web_prompt,
        web_mode: aiData.web_mode ? aiData.web_mode : oldAi.web_mode,
        web_selector: aiData.web_selector
          ? aiData.web_selector
          : oldAi.web_selector,
        on: aiData.on != undefined ? aiData.on : false,
      };
    } else {
      // 不存在同名配置，添加新配置
      if (configFile.ai == null || configFile.ai == undefined) {
        configFile.ai = [];
      }
      configFile.ai.push(aiData);
    }

    return await this.writeConfigFile(configFile);
  };

  /**
   * 读取 ai 配置
   * @returns
   */
  readAiDatas = async (): Promise<AiData[]> => {
    const configFile = await this.readConfigFile();
    return configFile.ai;
  };

  /**
   * 读取指定名字的 ai 配置
   * @param name
   * @returns
   */
  readAiData = async (name: string): Promise<AiData | undefined> => {
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
