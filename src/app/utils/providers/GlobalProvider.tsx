"use client";

/**
 * 全局 Provider 和 Context
 */
import { createContext, Dispatch, SetStateAction, useState } from "react";
import { AppData } from "../utils";

type GlobalContextType = {
  appConfig: AppData;
  setAppConfig: Dispatch<SetStateAction<AppData>>;
};

export const GlobalContext = createContext<GlobalContextType>({
  appConfig: {
    locale: "zh",
    showTray: true,
  },
  setAppConfig: () => {},
});

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [appConfig, setAppConfig] = useState<AppData>({
    locale: "zh",
    showTray: true,
  });

  return (
    <GlobalContext.Provider
      value={{
        appConfig,
        setAppConfig,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
