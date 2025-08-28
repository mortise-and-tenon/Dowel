import About from "@/app/components/settingchildren/About";
import SettingMenu from "@/app/components/SettingMenu";

/**
 * 设置页面
 * @returns
 */
export default function Setting() {
  return (
    <div className="flex w-full h-full">
      <div className="bg-base-100 w-60 border-r-2 border-base-300">
        <SettingMenu />
      </div>
      <div className="flex-1 bg-base-300 overflow-auto hide-scrollbar">
        <About />
      </div>
    </div>
  );
}
