"use client";

/**
 * 全局 Provider 和 Context
 * 使用方法：
 * 1. 获取当前语言和设置语言（主要用于配置管理）
 * const {locale, setLocale} = useContext(I18nContext);
 * locale：当前语言
 * setLocale：设置语言，setLocale("en")
 */
import { createContext, Dispatch, SetStateAction, useState } from "react";

type GlobalContextType = {
  locale: string;
  setLocale: Dispatch<SetStateAction<string>>;
};

interface Translations {
  [key: string]: string;
}

interface PlaceParam {
  [key: string]: string;
}

export const GlobalContext = createContext<GlobalContextType>({
  locale: "zh",
  setLocale: () => {},
});

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocale] = useState("zh");

  return (
    <GlobalContext.Provider
      value={{
        locale,
        setLocale,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
