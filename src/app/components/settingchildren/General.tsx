"use client";

import { GlobalContext } from "@/app/utils/providers/GlobalProvider";
import { TauriAdapter } from "@/app/utils/utils";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { themeChange } from "theme-change";
import TauriSystemTray, { TrayId } from "../SystemTray";
import { TrayIcon } from "@tauri-apps/api/tray";

/**
 * 通用设置页面
 * @returns
 */
export default function General() {
  const { appConfig, setAppConfig } = useContext(GlobalContext);

  const adapter = new TauriAdapter();

  const { i18n, t } = useTranslation();

  /**
   * 语言列表
   */
  const langs = [
    {
      name: "中文",
      value: "zh",
    },
    {
      name: "English",
      value: "en",
    },
  ];

  /**
   * 浅色主题
   */
  const lightThemes = [
    {
      name: "themes.light",
      value: "light",
    },
    {
      name: "themes.cupcake",
      value: "cupcake",
    },
    {
      name: "themes.emerald",
      value: "emerald",
    },
    {
      name: "themes.valentine",
      value: "valentine",
    },
    {
      name: "themes.lofi",
      value: "lofi",
    },
    {
      name: "themes.pastel",
      value: "pastel",
    },
  ];

  /**
   * 深色主题
   */
  const darkThemes = [
    {
      name: "themes.dark",
      value: "dark",
    },
    {
      name: "themes.forest",
      value: "forest",
    },
    {
      name: "themes.dracula",
      value: "dracula",
    },
    {
      name: "themes.night",
      value: "night",
    },
    {
      name: "themes.coffee",
      value: "coffee",
    },
    {
      name: "themes.dim",
      value: "dim",
    },
  ];

  useEffect(() => {
    themeChange(false);
  }, []);

  /**
   * 选择语言
   * @param e
   */
  const onSelectLang = async (e: any) => {
    i18n.changeLanguage(e.target.value);
    setAppConfig((pre) => {
      return { ...pre, locale: e.target.value };
    });
    await adapter.writeAppData({ ...appConfig, locale: e.target.value });
  };

  /**
   * 切换托盘展示/隐藏
   * @param e
   */
  const onChangeTray = async (e: any) => {
    setAppConfig((pre) => {
      return { ...pre, showTray: e.target.checked };
    });
    await adapter.writeAppData({ ...appConfig, showTray: e.target.checked });

    //隐藏时，销毁现有的托盘
    if (!e.target.checked) {
      const currentTray = await TrayIcon.getById(TrayId);
      if (currentTray) {
        currentTray.close();
      }
    }
  };

  return (
    <div className="h-full p-8">
      <div className="card bg-base-100 w-full shadow-sm">
        <div className="card-body">
          <div className="flex justify-between">
            <h3 className="card-title">{t("general.appearance")}</h3>
          </div>
          <hr className="border-base-300" />
          <div className="flex justify-between items-center">
            <span>{t("general.language")}</span>
            <select
              value={appConfig.locale}
              className="select w-40 focus:outline-none"
              onChange={onSelectLang}
            >
              {langs.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-between items-center">
            <span>{t("general.theme")}</span>
            <select
              data-choose-theme
              defaultValue="light"
              className="select w-40 focus:outline-none"
            >
              <option disabled={true}>----{t("themes.light")}----</option>
              {lightThemes.map((item) => (
                <option key={item.value} value={item.value}>
                  {t(item.name)}
                </option>
              ))}
              <option disabled={true}>----{t("themes.dark")}----</option>
              {darkThemes.map((item) => (
                <option key={item.value} value={item.value}>
                  {t(item.name)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 w-full shadow-sm mt-4">
        <div className="card-body">
          <div className="flex justify-between">
            <h3 className="card-title">{t("general.tray")}</h3>
          </div>
          <hr className="border-base-300" />
          <div className="flex justify-between items-center">
            {appConfig.showTray && <TauriSystemTray />}
            <span>{t("general.close_action")}</span>
            <input
              type="checkbox"
              className="toggle toggle-success"
              checked={appConfig.showTray}
              onChange={onChangeTray}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
