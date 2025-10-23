import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "../../locales/en.json";
import zh from "../../locales/zh.json";
import { TauriAdapter } from "../utils/utils";

const adapter = new TauriAdapter();

export async function initI18n() {
  // 从配置文件读取语言设置
  const config = await adapter.readAppData();
  const locale = config.locale || "zh";

  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        zh: { translation: zh },
      },
      lng: locale,
      fallbackLng: "zh",
      interpolation: {
        escapeValue: false,
      },
    });

  return i18n;
}

export default i18n;
