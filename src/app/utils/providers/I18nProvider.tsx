"use client";

/**
 * 国际化 Provider 和 Context
 * 相关配置文件在 locales 目录中。
 * langs 目录下，是不同的语言翻译的支持语言列表
 * xx.json 文件，xx 是 langs 中对应的语言代码。文件中是对应语言下的国际化文本。
 * 使用方法：
 * 1. 获取国际化文本
 * 组件中引用：
 * const {i18n} = useContext(I18nContext);
 * 代码中使用：
 * i18n("key");
 * 2. 获取当前语言和设置语言（主要用于配置管理）
 * const {locale, translation, setLocale} = useContext(I18nContext);
 * locale：当前语言
 * translation：支持的语言列表
 * setLocale：设置语言，setLocale("en")
 */
import {
  createContext,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from "react";

import Cookies from "js-cookie";

type I18nContextType = {
  locale: string;
  setLocale: Dispatch<SetStateAction<string>>;
  i18n: (key: string, param?: PlaceParam) => string;
  translation: Translations;
};

interface Translations {
  [key: string]: string;
}

interface PlaceParam {
  [key: string]: string;
}

export const I18nContext = createContext<I18nContextType>({
  locale: "zh",
  setLocale: () => {},
  i18n: (key: string) => {
    return key;
  },
  translation: {},
});

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocale] = useState("zh");
  const [translation, setTranslation] = useState<Translations>({});

  //用于客户端组件获取国际化文字的函数
  const i18n = (key: string, param?: PlaceParam): string => {
    const v = i18nInternal(key, translation);
    if (param != undefined) {
      return i18nReplaceParam(v, param);
    }
    return v;
  };

  //国际化带参数解析
  //示例：{"key":"我的名字是{name}"}
  //i18n("key",{name:"value"})
  const i18nReplaceParam = (str: string, param: PlaceParam) => {
    return str.replace(/{(\w+)}/g, (match, key) => {
      return key in param ? param[key] : match;
    });
  };

  //支持多层json，i18n("frist.two.three")
  const i18nInternal = (allKey: string, translation: any) => {
    if (allKey == undefined) {
      return allKey;
    }
    const keys = allKey.split(".");
    let result = translation;

    for (let key of keys) {
      if (result && key in result) {
        result = result[key];
      } else {
        return allKey;
      }
    }

    return result;
  };

  const loadI18nData = async () => {
    const jsonModule = await import(`../../../locales/${locale}.json`);
    setTranslation(jsonModule);
    return jsonModule;
  };

  useEffect(() => {
    if (locale != "") {
      loadI18nData();
    }
  }, []);

  useEffect(() => {
    if (locale != "") {
      loadI18nData();
    }
  }, [locale]);

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        i18n,
        translation,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};
