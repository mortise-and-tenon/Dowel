"use client";
import { ReactNode, useContext, useEffect, useState } from "react";
import {
  MdOutlineInfo,
  MdOutlineSettings,
  MdOutlineTranslate,
  MdSettingsVoice,
} from "react-icons/md";
import { GlobalContext } from "../utils/providers/GlobalProvider";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "next/navigation";

type SettingMenuData = {
  name: string;
  icon: ReactNode;
  i18nName: string;
};

/**
 * 设置菜单列表
 */
const menuDatas: SettingMenuData[] = [
  {
    name: "translation",
    icon: <MdOutlineTranslate className="text-xl" />,
    i18nName: "setting.translation",
  },
  // {
  //   name: "voice",
  //   icon: <MdSettingsVoice className="text-xl" />,
  //   i18nName: "setting.voice",
  // },
  {
    name: "ai",
    icon: <MdOutlineSettings className="text-xl" />,
    i18nName: "setting.ai",
  },
  {
    name: "general",
    icon: <MdOutlineSettings className="text-xl" />,
    i18nName: "setting.general",
  },
  {
    name: "about",
    icon: <MdOutlineInfo className="text-xl" />,
    i18nName: "setting.about",
  },
];

/**
 * 设置页面子菜单
 */
export default function SettingMenu({
  onSelectMenu,
}: {
  onSelectMenu: (menuName: string) => void;
}) {
  const { t } = useTranslation();
  const [focusMenu, setFocusMenu] = useState("translation");

  const searchParams = useSearchParams();

  useEffect(() => {
    const menuName = searchParams.get("menu");
    if (menuName) {
      const menu = menuDatas.find((item) => item.name === menuName);
      if (menu) {
        onClickMenu(menuName);
      }
    }
  }, []);

  /**
   * 点击设置菜单项
   * @param name
   */
  const onClickMenu = (name: string) => {
    setFocusMenu(name);
    onSelectMenu(name);
  };

  return (
    <ul className="menu w-full">
      {menuDatas.map((item) => (
        <li key={item.name} onClick={() => onClickMenu(item.name)}>
          <a
            className={`flex items-center ${
              item.name === focusMenu && "menu-active"
            }`}
          >
            {item.icon}
            {t(item.i18nName)}
          </a>
        </li>
      ))}
    </ul>
  );
}
