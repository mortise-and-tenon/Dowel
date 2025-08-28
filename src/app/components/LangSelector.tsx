"use client";

import { I18nContext } from "@/app/utils/providers/I18nProvider";
import { useContext } from "react";
import { IoLanguageOutline } from "react-icons/io5";

export default function LangSelector() {
  //国际化
  const { i18n } = useContext(I18nContext);

  //支持的语言列表
  const langList = ["zh", "en"];

  const { locale, setLocale } = useContext(I18nContext);

  const onSelectLocale = (selectedLocale: string) => {
    setLocale(selectedLocale);
  };

  return (
    <div className="dropdown">
      <div tabIndex={0} role="button" className="m-1 btn btn-ghost">
        {locale ? (
          <>
            <IoLanguageOutline />
            {i18n(langList.find((item) => item === locale) || "zh")}
          </>
        ) : (
          <span className="loading loading-ring loading-md"></span>
        )}
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content menu bg-base-100 rounded-box z-1 p-2 shadow-sm glass space-y-1"
      >
        {langList.map((item) => (
          <li key={item}>
            {item === locale ? (
              <a className="bg-gray-200 pointer-events-none">{i18n(item)}</a>
            ) : (
              <a onClick={() => onSelectLocale(item)}>{i18n(item)}</a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
