"use client";

import {
  DefaultTranslations,
  TranslationProvider,
} from "@/app/utils/translations/translationInferace";
import { TauriAdapter, TranslationData } from "@/app/utils/utils";
import { ReactNode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaCircleCheck } from "react-icons/fa6";
import { useContext } from "react";
import { GlobalContext } from "@/app/utils/providers/GlobalProvider";
import { createIntl, createIntlCache } from "@formatjs/intl";

type TranslationToken = {
  name: string;
  i18nName: string;
  logo: ReactNode;
  limit: number;
  on: boolean;
  used: number;
};

const adapter = new TauriAdapter();

export default function Main() {
  const { appConfig } = useContext(GlobalContext);
  const { t } = useTranslation();
  const [translations, setTranslations] = useState<TranslationToken[]>([]);
  useEffect(() => {
    readTranslations();
  }, []);

  const cache = createIntlCache();

  const formatCompactNumber = (num: number, locale: string = "zh-CN") => {
    const intl = createIntl(
      {
        locale,
        messages: {},
      },
      cache
    );

    return intl.formatNumber(num, {
      notation: "compact",
      compactDisplay: "short",
    });
  };

  const readTranslations = async () => {
    await adapter.resetTokenUsedMonth();
    let data = await adapter.readTranslations();

    data = await adapter.readTranslations();

    let resultData: TranslationToken[] = [];
    if (data.length > 0) {
      resultData = data
        .map((a: TranslationData) => {
          const b = DefaultTranslations.find(
            (item: TranslationData) => item.name === a.name
          );
          if (b) {
            return {
              name: b.name,
              i18nName: b.i18nName,
              logo: b.logo,
              on: a.on,
              limit: a.limit ? a.limit : 0,
              used: a.used ? a.used : 0,
            };
          }
          return null;
        })
        .filter((item) => item != null);
    } else {
      resultData = DefaultTranslations.map((a: TranslationProvider) => {
        return {
          name: a.name,
          i18nName: a.i18nName,
          logo: a.logo,
          on: a.on,
          limit: a.limit ? a.limit : 0,
          used: 0,
        };
      });
    }

    setTranslations(resultData);
  };

  return (
    <div className="w-full h-full p-4">
      {translations.map((item) => (
        <div className="flex flex-col mb-4" key={item.name}>
          <h1 className="font-black pb-4 flex items-center">
            <div className="w-20 flex justify-center">{item.logo}</div>
            <span className="pl-2">{t(item.i18nName)}</span>
            {item.on && (
              <span className="pl-2">
                <FaCircleCheck className="text-success" />
              </span>
            )}
          </h1>
          <div className="stats shadow bg-base-100 flex">
            <div className="stat place-items-center">
              <div className="stat-title">{t("translation.token_used")}</div>
              <div className="stat-value text-secondary">
                {formatCompactNumber(item.used, appConfig.locale)}
              </div>
              <div className="stat-desc">{t("translation.token_label")}</div>
            </div>

            <div className="stat place-items-center">
              <div className="stat-title">{t("translation.token_limit")}</div>
              <div className="stat-value">
                {formatCompactNumber(item.limit, appConfig.locale)}
              </div>
              <div className="stat-desc">
                {t("translation.token_limit_label")}
              </div>
              <div className="stat-desc"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
