"use client";
import { getCurrentWindow, Window } from "@tauri-apps/api/window";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  MdOutlineHome,
  MdOutlineTranslate,
  MdOutlineSettings,
} from "react-icons/md";
import {
  VscChromeClose,
  VscChromeMaximize,
  VscChromeMinimize,
  VscChromeRestore,
} from "react-icons/vsc";
import Menu, { MenuData } from "../components/Menu";
import ThemeChanger from "../components/ThemeSwitcher";
import { useContext } from "react";
import { I18nContext } from "../utils/providers/I18nProvider";

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [appWindow, setAppWindow] = useState<Window | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  useEffect(() => {
    const appWindow = getCurrentWindow();
    setAppWindow(appWindow);
  }, []);

  const onClickMinimize = () => {
    if (appWindow != null) {
      appWindow.minimize();
    }
  };

  const onClickMaxmize = async () => {
    if (appWindow != null) {
      await appWindow.toggleMaximize();
      const status = await appWindow.isMaximized();
      setIsMaximized(status);
    }
  };

  const onClickClose = () => {
    if (appWindow != null) {
      appWindow.close();
    }
  };

  const { i18n } = useContext(I18nContext);

  /**
   * 选中的菜单名称
   */
  const [menuTitle, setMenuTitle] = useState("menu.home");

  const onChangeTitle = (i18nName: string) => {
    if (i18nName != "") {
      setMenuTitle(i18nName);
    }
  };

  /**
   * 菜单配置
   */
  const menuDatas: MenuData[] = [
    {
      name: "home",
      icon: <MdOutlineHome className="text-2xl" />,
      i18nName: "menu.home",
      link: "/home",
    },
    {
      name: "translation",
      icon: <MdOutlineTranslate className="text-2xl" />,
      i18nName: "menu.translation",
      link: "/translation",
    },
  ];

  return (
    <div className="flex flex-col h-screen">
      <div
        data-tauri-drag-region
        className="h-12 flex justify-between items-center bg-base-200"
      >
        <div className="flex ">
          <div className="w-14 flex justify-center">
            <Image src="/truss.png" width={20} height={20} alt="logo" />
          </div>
          <span className="font-black">{i18n(menuTitle)}</span>
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
            className="h-full hover:bg-primary/20 hover:text-primary 
                    transition-all duration-200 px-2"
          >
            <VscChromeClose className="text-2xl" />
          </button>
        </div>
      </div>
      <div className="flex-1 flex">
        <div data-tauri-drag-region className="flex">
          <Menu
            menudata={menuDatas}
            deFaultFocus="home"
            onChange={onChangeTitle}
          />
        </div>
        <div className="flex-1 rounded-box">{children}</div>
      </div>
    </div>
  );
}
