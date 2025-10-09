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

export type ConfigFile = {
  app: AppData;
  providers: ProviderData[];
};

export interface PlatformAdapter {
  readConfigData(): Promise<ConfigFile>;
  writeAppData(appData: AppData): void;
  readAppData(): Promise<AppData>;
  writeProviderData(providerData: ProviderData): void;
  readProviders(): Promise<ProviderData[]>;
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
      // 不存在同名模型，添加新供应商
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
