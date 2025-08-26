"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useContext, useState } from "react";
import { MdOutlineSettings } from "react-icons/md";
import { I18nContext } from "../utils/providers/I18nProvider";
import React from "react";

/**
 * 菜单定义
 */
export type MenuData = {
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
};

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
];

export default function Menu({
  menudata,
  deFaultFocus,
  onChange,
}: {
  menudata: MenuData[];
  deFaultFocus: string;
  onChange: (i18nName: string) => void;
}) {
  const router = useRouter();

  const { i18n } = useContext(I18nContext);

  /**
   * 选中的菜单
   */
  const [focusMenu, setFocusMenu] = useState(deFaultFocus);

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
  const onExtraMenuSelected = (
    name: string,
    i18nName: string,
    link: string
  ) => {
    if (focusMenu != "") {
      setFocusMenu("");
    }
    setFocusExtraMenu(name);
    onChange(i18nName);
    router.push(link);
  };

  return (
    <div className="bg-base-200 flex flex-col justify-between">
      <ul className="menu menu-xs">
        {menudata.map((item) => (
          <li
            onClick={() => onMenuSelected(item.name, item.i18nName, item.link)}
            key={item.name}
          >
            <a
              className={`tooltip tooltip-right ${
                item.name === focusMenu && "menu-active"
              }`}
              data-tip={i18n(item.i18nName)}
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
              onExtraMenuSelected(item.name, item.i18nName, item.link)
            }
            key={item.name}
          >
            <a
              className={`tooltip tooltip-right ${
                item.name === focusExtraMenu && "menu-active"
              }`}
              data-tip={i18n(item.i18nName)}
            >
              {item.icon}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
