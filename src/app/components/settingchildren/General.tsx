"use client";

import { I18nContext } from "@/app/utils/providers/I18nProvider";
import { useEffect } from "react";
import { useContext } from "react";
import { themeChange } from "theme-change";

/**
 * 通用设置页面
 * @returns
 */
export default function General() {
  const { i18n, setLocale } = useContext(I18nContext);

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
      value: "ngiht",
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
  const onSelectLang = (e: any) => {
    setLocale(e.target.value);
  };

  return (
    <div className="h-full p-8">
      <div className="card bg-base-100 w-full shadow-sm">
        <div className="card-body">
          <div className="flex justify-between">
            <h3 className="card-title">{i18n("general.appearance")}</h3>
          </div>
          <hr className="border-base-300" />
          <div className="flex justify-between items-center">
            <span>{i18n("general.language")}</span>
            <select
              defaultValue="zh"
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
            <span>{i18n("general.theme")}</span>
            <select
              data-choose-theme
              defaultValue="light"
              className="select w-40 focus:outline-none"
            >
              <option disabled={true}>----{i18n("themes.light")}----</option>
              {lightThemes.map((item) => (
                <option key={item.value} value={item.value}>
                  {i18n(item.name)}
                </option>
              ))}
              <option disabled={true}>----{i18n("themes.dark")}----</option>
              {darkThemes.map((item) => (
                <option key={item.value} value={item.value}>
                  {i18n(item.name)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
