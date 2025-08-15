"use client";

import { createContext, useEffect, useState } from "react";
import {
  Env_HeaderLogo,
  Env_HeaderTitle,
  Env_LoginFormPosition,
  Env_ProjectName,
} from "../envUtils";

export type LoginFormPositionType = "RIGHT" | "CENTER";

export type CustomConfig = {
  loginFormPosition: LoginFormPositionType;
  header: {
    logo: string;
    title: string;
  };
};

type ThemeType = {
  theme: string;
  customConfig: CustomConfig;
  toggleTheme: () => void;
};

const defaultCustomConfig: CustomConfig = {
  loginFormPosition: "RIGHT",
  header: {
    logo: "/truss.png",
    title: "Truss Web",
  },
};

export const ThemeContext = createContext<ThemeType>({
  theme: "light",
  customConfig: defaultCustomConfig,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState("light");
  const [customConfig, setCustomConfig] =
    useState<CustomConfig>(defaultCustomConfig);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (savedTheme) {
      setTheme(savedTheme);
    } else if (prefersDark) {
      setTheme("dark");
    }

    setCustomConfig({
      loginFormPosition: Env_LoginFormPosition,
      header: {
        logo: Env_HeaderLogo,
        title: Env_ProjectName,
      },
    });
  }, []);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, customConfig, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
