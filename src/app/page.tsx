"use client";
import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { themeChange } from "theme-change";
import { GlobalContext } from "./utils/providers/GlobalProvider";
import { TauriAdapter } from "./utils/utils";

export default function Home() {
  const { setAppConfig } = useContext(GlobalContext);
  const { t } = useTranslation();
  const router = useRouter();

  const adapter = new TauriAdapter();

  useEffect(() => {
    themeChange(false);
    readAppConfig();

    const timer = setTimeout(() => {
      router.push("/home");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const readAppConfig = async () => {
    const config = await adapter.readAppData();
    if (config) {
      setAppConfig(config);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="fulltitlebar">
        <div
          data-tauri-drag-region
          className="flex flex-col justify-center items-center"
        >
          <div>
            <img src="/truss.png" width={80} height={80} alt="logo" />
          </div>

          {/* 主标题 */}
          <h1 className="text-[clamp(2rem,5vw,3rem)] font-bold text-gray-800 mb-4 text-center">
            {t("app_name")}
          </h1>

          {/* 副标题 */}
          <p className="text-gray-600 text-center max-w-xs mb-8">
            {t("app_desc")}
          </p>
          <span className="loading loading-dots text-primary"></span>
        </div>
      </div>
    </div>
  );
}
