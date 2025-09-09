import {
  BaseDirectory,
  exists,
  readTextFile,
  writeTextFile,
} from "@tauri-apps/plugin-fs";
import CryptoJS from "crypto-js";

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

export type ConfigFile = {
  app: AppData;
};

export interface PlatformAdapter {
  readConfigData(): Promise<ConfigFile>;
  writeAppData(appData: AppData): void;
}

export class TauriAdapter implements PlatformAdapter {
  readConfigData = async () => {
    const fileExists = await exists(CONFIG_FILE_NAME, {
      baseDir: BaseDirectory.Home,
    });
    if (!fileExists) {
      return [];
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
}
