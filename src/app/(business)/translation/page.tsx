"use client";
import { I18nContext } from "@/app/utils/providers/I18nProvider";
import { AliTranslation } from "@/app/utils/translations/aliTranslation";
import { BaiduTranslation } from "@/app/utils/translations/baiduTranslation";
import {
  CommonLangCode,
  DefaultTranslations,
  LangCode,
  TranslationInterface,
} from "@/app/utils/translations/translationInferace";
import { TauriAdapter, TranslationData } from "@/app/utils/utils";
import { ReactNode, useContext, useEffect, useState } from "react";
import { GoArrowSwitch } from "react-icons/go";
import { MdOutlineTranslate } from "react-icons/md";
import { RiFileCopyLine } from "react-icons/ri";
import Select, { Options } from "react-select";

type TranslationDisplay = {
  name: string;
  i18nName: string;
  logo: ReactNode;
  translatedText: string;
};

export default function Translation() {
  const { i18n } = useContext(I18nContext);

  const adapter = new TauriAdapter();

  /**
   * 待翻译的原文
   */
  const [originalText, setOriginalText] = useState("");

  /**
   * 翻译按钮可用/禁用
   */
  const [enableBtn, setEnableBtn] = useState(false);

  type TranslationInstnace = {
    [key: string]: TranslationInterface;
    aliyun: AliTranslation;
    baidu: BaiduTranslation;
  };

  /**
   * 翻译源实体对象映射
   */
  const translationInstances: TranslationInstnace = {
    aliyun: new AliTranslation(),
    baidu: new BaiduTranslation(),
  };

  /**
   * 已启用的翻译源
   */
  const [translationData, setTranslationData] = useState<TranslationDisplay[]>(
    []
  );

  useEffect(() => {
    readTranslations();
  }, []);

  /**
   * 获取已启用的翻译源
   */
  const readTranslations = async () => {
    const data: TranslationData[] = await adapter.readTranslations();

    if (data.length > 0) {
      const resultData = data
        .filter((item) => item.on)
        .map((a: TranslationData) => {
          const b = DefaultTranslations.find(
            (item: TranslationData) => item.name === a.name
          );
          if (b) {
            return {
              name: b.name,
              i18nName: b.i18nName,
              logo: b.logo,
              translatedText: "",
            };
          }
          return null;
        })
        .filter((item) => item != null);
      setTranslationData(resultData);
    }
  };

  /**
   * 点击翻译按钮
   */
  const onTranslate = async () => {
    try {
      translationData.forEach(async (item) => {
        const result = await translationInstances[item.name].translate(
          originalText,
          "auto",
          "en"
        );

        setTranslationData((pre) => {
          const newData = pre.map((data) =>
            data.name === item.name
              ? { ...data, translatedText: result.translated }
              : data
          );
          return newData;
        });
      });
    } catch (error: any) {
      console.error("翻译失败:", error.message);
    }
  };

  /**
   * 输入原文
   * @param e
   */
  const onChangeOriginal = (e: any) => {
    setOriginalText(e.target.value);

    setEnableBtn(e.target.value != "");
  };

  return (
    <div className="flex w-full h-full">
      <div className="flex-1 p-4">
        <textarea
          className="textarea h-60 w-full"
          placeholder="原文"
          value={originalText}
          onChange={onChangeOriginal}
        ></textarea>
        <div className="mt-2 flex justify-between w-full p-2 bg-base-100 rounded-lg">
          <div className="flex w-full space-x-2">
            <select className="select focus:outline-none">
              <option value="auto">{i18n("langs.auto")}</option>
              {CommonLangCode.map((item) => (
                <option value={item}>{i18n(`langs.${item}`)}</option>
              ))}
            </select>

            <button className="btn btn-ghost">
              <GoArrowSwitch />
            </button>
            <select className="select focus:outline-none">
              {CommonLangCode.map((item) => (
                <option value={item}>{i18n(`langs.${item}`)}</option>
              ))}
            </select>
          </div>
          <button
            className="btn btn-ghost btn-primary ml-2"
            onClick={onTranslate}
            disabled={!enableBtn}
          >
            <MdOutlineTranslate className="text-2xl" />
          </button>
        </div>
      </div>
      <div className="flex-1 p-4 space-y-2 overflow-y-auto hide-scrollbar">
        {translationData.map((item) => (
          <div
            className="collapse collapse-arrow bg-base-300 border-base-300 border"
            key={item.name}
          >
            <input type="checkbox" />
            <div className="collapse-title bg-base-200">
              <div className="flex items-center">
                <div className="w-20">{item.logo}</div>
                <span className="pl-2 font-semibold">
                  {i18n(item.i18nName)}
                </span>
              </div>
            </div>
            <div className="collapse-content bg-base-100">
              <div className="pt-2">
                <div>{item.translatedText}</div>
                {item.translatedText && (
                  <div className="flex justify-end">
                    <button className="btn btn-ghost">
                      <RiFileCopyLine className="text-xl" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
