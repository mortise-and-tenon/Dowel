"use client";
import Image from "next/image";
import { useContext } from "react";
import { useEffect } from "react";
import { themeChange } from "theme-change";
import { I18nContext } from "./utils/providers/I18nProvider";
import { useRouter } from "next/navigation";

export default function Home() {
  const { i18n, translation } = useContext(I18nContext);
  const router = useRouter();

  useEffect(() => {
    themeChange(false);
    const timer = setTimeout(() => {
      router.push("/home"); // 替换为你的主页面路径
    }, 3000);

    return () => clearTimeout(timer);
  }, []);
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

          {Object.keys(translation).length == 0 ? (
            <span className="loading loading-dots loading-xl text-primary h-[156px]"></span>
          ) : (
            <>
              {/* 主标题 */}
              <h1 className="text-[clamp(2rem,5vw,3rem)] font-bold text-gray-800 mb-4 text-center">
                {Object.keys(translation).length != 0 ? i18n("app_name") : ""}
              </h1>

              {/* 副标题 */}
              <p className="text-gray-600 text-center max-w-xs mb-8">
                {i18n("app_desc")}
              </p>
              <span className="loading loading-spinner text-primary"></span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
