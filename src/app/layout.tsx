"use client";
import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import "./globals.css";
import "./lib/i18n"; // 导入 i18n 配置
import { initI18n } from "./lib/i18n";
import { GlobalProvider } from "./utils/providers/GlobalProvider";
import TauriSystemTray from "./components/SystemTray";
import { TrayIcon, TrayIconEvent } from "@tauri-apps/api/tray";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [i18nInstance, setI18nInstance] = useState<any>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const i18n = await initI18n();
        setI18nInstance(i18n);
      } catch (error) {
        console.error("Failed to initialize i18n:", error);
      }
    };

    initializeApp();

    const handleContextMenu = (e: Event) => {
      e.preventDefault();
    };

    document.addEventListener("contextmenu", handleContextMenu);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  return (
    <html lang="en">
      <body className={`antialiased`}>
        {i18nInstance ? (
          <I18nextProvider i18n={i18nInstance}>
            <TauriSystemTray />
            <GlobalProvider>{children}</GlobalProvider>
          </I18nextProvider>
        ) : (
          <div
            data-tauri-drag-region
            className="flex flex-col justify-center items-center h-screen"
          >
            <span className="loading loading-dots loading-xl text-primary h-[156px]"></span>
          </div>
        )}
      </body>
    </html>
  );
}
