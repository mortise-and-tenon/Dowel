"use client";
import { getCurrentWindow, Window } from "@tauri-apps/api/window";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  VscChromeClose,
  VscChromeMaximize,
  VscChromeMinimize,
  VscChromeRestore,
} from "react-icons/vsc";
import Menu from "../components/Menu";
import ThemeChanger from "../components/ThemeSwitcher";
import "../globals.css";
import { GlobalContext } from "../utils/providers/GlobalProvider";

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { appConfig } = useContext(GlobalContext);

  /**
   * 窗体实例
   */
  const [appWindow, setAppWindow] = useState<Window | null>(null);

  /**
   * 窗体最大化标识
   */
  const [isMaximized, setIsMaximized] = useState(false);
  useEffect(() => {
    const appWindow = getCurrentWindow();
    setAppWindow(appWindow);
  }, []);

  /**
   * 点击最小化
   */
  const onClickMinimize = () => {
    if (appWindow != null) {
      appWindow.minimize();
    }
  };

  /**
   * 点击最大化/恢复
   */
  const onClickMaxmize = async () => {
    if (appWindow != null) {
      await appWindow.toggleMaximize();
      const status = await appWindow.isMaximized();
      setIsMaximized(status);
    }
  };

  /**
   * 点击关闭/隐藏
   */
  const onClickClose = () => {
    if (appWindow != null) {
      if (appConfig.showTray) {
        appWindow.hide();
      } else {
        appWindow.close();
      }
    }
  };

  const { t } = useTranslation();

  /**
   * 选中的菜单名称
   */
  const [menuTitle, setMenuTitle] = useState("menu.home");

  /**
   * 选中菜单后调整标题栏菜单名称
   * @param i18nName
   */
  const onChangeTitle = (i18nName: string) => {
    if (i18nName != "") {
      setMenuTitle(i18nName);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div
        data-tauri-drag-region
        className="h-12 flex justify-between items-center bg-base-200"
      >
        <div className="flex items-center">
          <div className="w-14 flex justify-center items-center">
            <img src="/truss.png" width={30} height={30} alt="logo" />
          </div>
          <span className="font-black">{t(menuTitle)}</span>
        </div>
        <div className="h-full flex items-center">
          <ThemeChanger />
          <button
            title="minimize"
            onClick={onClickMinimize}
            className="h-full hover:bg-primary/20 hover:text-primary 
                    transition-all duration-200 px-2"
          >
            <VscChromeMinimize className="text-2xl" />
          </button>
          <button
            title="maximize"
            onClick={onClickMaxmize}
            className="h-full hover:bg-primary/20 hover:text-primary 
                    transition-all duration-200 px-2"
          >
            {isMaximized ? (
              <VscChromeRestore className="text-2xl" />
            ) : (
              <VscChromeMaximize className="text-2xl" />
            )}
          </button>
          <button
            title="close"
            onClick={onClickClose}
            className="h-full hover:bg-error hover:text-white 
                    transition-all duration-200 px-2"
          >
            <VscChromeClose className="text-2xl" />
          </button>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden" id="parent-container">
        <Menu onChange={onChangeTitle} />

        <div className="flex-1 bg-base-300 border-1 border-base-300">
          {children}
        </div>
      </div>
    </div>
  );
}
