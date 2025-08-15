"use client";
import { useContext } from "react";
import { ThemeContext } from "./utils/providers/ThemeProvider";

export default function Home() {
  const { customConfig } = useContext(ThemeContext);
  return (
    <div className="flex flex-col h-screen">
      <div
        className={`flex-1 flex items-center ${
          customConfig.loginFormPosition === "RIGHT"
            ? "justify-center lg:justify-end lg:pr-16"
            : "justify-center"
        }`}
      >
        Truss Tauri开屏
      </div>
    </div>
  );
}
