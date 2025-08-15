"use client";
import { useContext } from "react";
import { ThemeContext } from "./utils/providers/ThemeProvider";
import Image from "next/image";

export default function Home() {
  const { customConfig } = useContext(ThemeContext);
  return (
    <div className="flex flex-col h-screen">
      <div className="fulltitlebar">
        <div
          data-tauri-drag-region
          className="flex flex-col justify-center items-center"
        >
          <div>
            <Image src="/truss.png" width={80} height={80} alt="logo" />
          </div>

          {/* 主标题 */}
          <h1 className="text-[clamp(2rem,5vw,3rem)] font-bold text-gray-800 mb-4 text-center">
            导维
          </h1>

          {/* 副标题 */}
          <p className="text-gray-600 text-center max-w-xs mb-8">
            简洁高效的 AI 应用平台
          </p>

          {/* 加载指示器 */}
          <span className="loading loading-dots loading-md text-primary"></span>
        </div>
      </div>
    </div>
  );
}
