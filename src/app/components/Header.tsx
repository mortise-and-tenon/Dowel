import Image from "next/image";
import { useContext } from "react";
import { ThemeContext } from "../utils/providers/ThemeProvider";
import { IoLanguageOutline } from "react-icons/io5";
import LangSelector from "./children/LangSelector";

/**
 * 未登录的页面头部内容
 *
 * @returns
 */
export default function Header() {
  const { customConfig } = useContext(ThemeContext);
  return (
    <div className="h-12 glass flex justify-between px-2">
      <div className="flex items-center">
        <Image
          src={customConfig.header.logo}
          width={30}
          height={30}
          alt="logo"
        />
        <span className="text-lg font-bold pl-2">
          {customConfig.header.title}
        </span>
      </div>

      <LangSelector />
    </div>
  );
}
