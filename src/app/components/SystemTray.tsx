"use client"; // 声明为客户端组件

import { defaultWindowIcon } from "@tauri-apps/api/app";
import { Menu } from "@tauri-apps/api/menu";
import { TrayIcon, TrayIconEvent } from "@tauri-apps/api/tray";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

export default function TauriSystemTray() {
  const { t, i18n } = useTranslation();
  const TrayId = "Dowel";

  /**
   * 点击菜单操作
   */
  const onTrayMenuClick = async (itemId: string) => {
    const appWindow = await getCurrentWindow();
    switch (itemId) {
      case "show":
        await appWindow.show();
        await appWindow.setFocus();
        break;
      case "hide":
        await appWindow.hide();
        break;
      case "quit":
        await appWindow.close();
        break;
      default:
        break;
    }
  };

  /**
   * 图标操作事件
   * @param event
   */
  const onTrayAction = async (event: TrayIconEvent) => {
    const appWindow = await getCurrentWindow();
    switch (event.type) {
      case "DoubleClick":
        await appWindow.show();
        await appWindow.setFocus();
        break;
      default:
        break;
    }
  };

  let isInitializing = false;

  // 初始化系统托盘的函数
  const initAndUpdateTray = async () => {
    try {
      // 1. 创建托盘菜单
      const menu = await Menu.new({
        items: [
          {
            id: "show",
            text: t("tray.show"),
            action: onTrayMenuClick,
          },
          {
            id: "hide",
            text: t("tray.hide"),
            action: onTrayMenuClick,
          },
          {
            id: "quit",
            text: t("tray.quit"),
            action: onTrayMenuClick,
          },
        ],
      });

      if (isInitializing) {
        console.log("repeat");
        return;
      }

      isInitializing = true;

      const currentTray = await TrayIcon.getById(TrayId);

      if (currentTray) {
        await currentTray.setMenu(menu);
        return;
      }

      const icon = await defaultWindowIcon();
      const options = {
        icon: icon ? icon : "truss.png",
        menu,
        menuOnLeftClick: true,
        action: onTrayAction,
        id: TrayId,
      };

      await TrayIcon.new(options);
    } catch (err) {
      console.error("初始化系统托盘失败:", err);
    } finally {
      isInitializing = false;
    }
  };

  useEffect(() => {
    initAndUpdateTray();
    i18n.on("languageChanged", initAndUpdateTray);
    return () => i18n.off("languageChanged", initAndUpdateTray);
  }, []);

  // 该组件无需渲染任何内容，仅用于初始化托盘
  return null;
}
