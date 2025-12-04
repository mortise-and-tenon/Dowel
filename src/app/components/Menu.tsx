"use client";

import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  MdOutlineHelpOutline,
  MdOutlineHome,
  MdOutlineSettings,
  MdOutlineTranslate,
} from "react-icons/md";
import { open } from "@tauri-apps/plugin-shell";

/**
 * 菜单定义
 */
type MenuData = {
  /**
   * 菜单名称，用于区分菜单
   */
  name: string;

  /**
   * 图标
   */
  icon: ReactNode;

  /**
   * 国际化的菜单名
   */
  i18nName: string;

  /**
   * 菜单跳转链接
   */
  link: string;

  /**
   * 是否外链
   */
  extra?: boolean;
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

/**
 * 固定的扩展菜单配置，如设置
 */
const extraMenuDatas: MenuData[] = [
  {
    name: "setting",
    icon: <MdOutlineSettings className="text-2xl" />,
    i18nName: "menu.setting",
    link: "/setting",
  },
  {
    name: "help",
    icon: <MdOutlineHelpOutline className="text-2xl" />,
    i18nName: "menu.help",
    link: "https://dowel.mortnon.tech/docs/intro",
    extra: true,
  },
];

/**
 * 菜单组件
 * @param param0
 * @returns
 */
export default function Menu({
  onChange,
}: {
  onChange: (i18nName: string) => void;
}) {
  const router = useRouter();

  const { t } = useTranslation();

  const path = usePathname();

  useEffect(() => {
    const menu = menuDatas.find((item) => item.link === path);
    if (menu) {
      setFocusExtraMenu("");
      setFocusMenu(menu?.name);
      onChange(menu.i18nName);
    }

    const extraMenu = extraMenuDatas.find((item) => item.link === path);
    if (extraMenu) {
      setFocusMenu("");
      setFocusExtraMenu(extraMenu.name);
      onChange(extraMenu.i18nName);
    }
  }, [path]);

  /**
   * 选中的菜单
   */
  const [focusMenu, setFocusMenu] = useState("home");

  /**
   * 选中的扩展菜单
   */
  const [focusExtraMenu, setFocusExtraMenu] = useState("");

  /**
   * 菜单选择，与扩展菜单互斥
   * @param name
   */
  const onMenuSelected = (name: string, i18nName: string, link: string) => {
    if (focusExtraMenu != "") {
      setFocusExtraMenu("");
    }
    setFocusMenu(name);
    onChange(i18nName);
    router.push(link);
  };

  /**
   * 扩展菜单选择，与菜单互斥
   * @param name
   */
  const onExtraMenuSelected = async (
    name: string,
    i18nName: string,
    link: string,
    extra: boolean
  ) => {
    if (extra) {
      try {
        await open(link);
      } catch (error) {
        console.error("open url fail:", error);
      }
    } else {
      if (focusMenu != "") {
        setFocusMenu("");
      }
      setFocusExtraMenu(name);
      onChange(i18nName);
      router.push(link);
    }
  };

  return (
    <div
      data-tauri-drag-region
      className="bg-base-200 flex flex-col justify-between"
    >
      <ul className="menu menu-xs">
        {menuDatas.map((item) => (
          <li
            onClick={() => onMenuSelected(item.name, item.i18nName, item.link)}
            key={item.name}
          >
            <a
              className={`tooltip tooltip-right ${
                item.name === focusMenu && "menu-active"
              }`}
              data-tip={t(item.i18nName)}
            >
              {item.icon}
            </a>
          </li>
        ))}
      </ul>
      <ul className="menu menu-xs">
        {extraMenuDatas.map((item) => (
          <li
            onClick={() =>
              onExtraMenuSelected(
                item.name,
                item.i18nName,
                item.link,
                item.extra ? item.extra : false
              )
            }
            key={item.name}
          >
            <a
              className={`tooltip tooltip-right ${
                item.name === focusExtraMenu && "menu-active"
              }`}
              data-tip={t(item.i18nName)}
            >
              {item.icon}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
