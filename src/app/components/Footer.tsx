import { useContext } from "react";
import { I18nContext } from "../utils/providers/I18nProvider";

/**
 * 底部组件，用于展示版本信息等
 * 使用了国际化串：copyright
 */
export default function Footer() {
  //国际化
  const { i18n } = useContext(I18nContext);

  return (
    <div className="h-12 flex justify-center items-center text-white text-base">{`${i18n(
      "copyright"
    )} © ${new Date().getFullYear()} ${i18n("corp_name")}`}</div>
  );
}
