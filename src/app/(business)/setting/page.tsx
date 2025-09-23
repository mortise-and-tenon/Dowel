"use client";
import About from "@/app/components/settingchildren/About";
import Ai from "@/app/components/settingchildren/AI";
import General from "@/app/components/settingchildren/General";
import SettingMenu from "@/app/components/SettingMenu";
import { useState } from "react";

/**
 * 设置页面
 * @returns
 */
export default function Setting() {
  const [selectedMenu, setSelectedMenu] = useState("translation");
  //选择设置子菜单
  const onSelectMenu = (menuName: string) => {
    setSelectedMenu(menuName);
  };

  return (
    <div className="flex h-full">
      <div className="bg-base-100 w-60 border-r-2 border-base-300">
        <SettingMenu onSelectMenu={onSelectMenu} />
      </div>
      <div className="flex-1 bg-base-300 h-full">
        {selectedMenu === "ai" && <Ai />}
        {selectedMenu === "general" && <General />}
        {selectedMenu === "about" && <About />}
      </div>
    </div>
  );
}
