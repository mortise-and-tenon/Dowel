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
import { AiData, TauriAdapter, TranslationData } from "@/app/utils/utils";
import { useRef } from "react";
import { ReactNode, useContext, useEffect, useState } from "react";
import { GoArrowSwitch } from "react-icons/go";
import { MdAutoAwesome, MdOutlineTranslate } from "react-icons/md";
import { RiFileCopyLine } from "react-icons/ri";
import Select, { Options } from "react-select";

type TranslationDisplay = {
  name: string;
  i18nName: string;
  logo: ReactNode;
  translatedText: string;
};

export default function Translation() {
  const { i18n, locale } = useContext(I18nContext);

  const adapter = new TauriAdapter();

  /**
   * 原文文本输入框
   */
  const sourceTextRef = useRef<HTMLTextAreaElement>(null);

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

  /**
   * 已启用的AI翻译
   */
  const [aiData, setAiData] = useState<AiData>();

  useEffect(() => {
    readTranslations();
    readAiData();

    if (sourceTextRef.current) {
      const timer = setTimeout(() => {
        if (sourceTextRef.current !== null) {
          sourceTextRef.current.focus();
        }
      }, 100);

      return () => clearTimeout(timer);
    }
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
   * 读取AI翻译配置
   */
  const readAiData = async () => {
    const data = await adapter.readAiData("translation");
    if (data && data.on) {
      setAiData(data);
    }
  };

  /**
   * AI翻译的文字
   */
  const [aiTranslatedText, setAiTranslatedText] = useState("");

  /**
   * 点击翻译按钮
   */
  const onTranslate = async () => {
    try {
      translationData.forEach(async (item) => {
        const result = await translationInstances[item.name].translate(
          originalText,
          source,
          target
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

  /**
   * 原文语言
   */
  const [source, setSource] = useState("auto");

  /**
   * 翻译语言
   */
  const [target, setTarget] = useState(locale);

  /**
   * 切换原文语言
   * @param e
   */
  const onSelectSource = (e: any) => {
    setSource(e.target.value);
  };

  /**
   * 切换翻译语言
   * @param e
   */
  const onSelectTarget = (e: any) => {
    setTarget(e.target.value);
  };

  return (
    <div className="flex w-full h-full">
      <div className="flex-1 p-4">
        <textarea
          className="textarea h-60 w-full focus:outline-none"
          ref={sourceTextRef}
          placeholder="原文"
          value={originalText}
          onChange={onChangeOriginal}
        ></textarea>
        <div className="mt-2 flex justify-between w-full p-2 bg-base-100 rounded-lg">
          <div className="flex w-full space-x-2">
            <select
              className="select focus:outline-none"
              value={source}
              onChange={onSelectSource}
            >
              <option value="auto">{i18n("langs.auto")}</option>
              {CommonLangCode.map((item) => (
                <option key={`source-${item}`} value={item}>
                  {i18n(`langs.${item}`)}
                </option>
              ))}
            </select>

            <button className="btn btn-ghost">
              <GoArrowSwitch />
            </button>
            <select
              className="select focus:outline-none"
              value={target}
              onChange={onSelectTarget}
            >
              {CommonLangCode.map((item) => (
                <option key={`target-${item}`} value={item}>
                  {i18n(`langs.${item}`)}
                </option>
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
        {aiData && (
          <div
            className="collapse collapse-arrow collapse-open bg-base-300 border-base-300 border"
            key="AI"
          >
            <input type="checkbox" />
            <div className="collapse-title bg-base-200">
              <div className="flex items-center">
                <div className="w-20 flex justify-center">
                  <MdAutoAwesome className="text-primary" />
                </div>
                <span className="pl-2 font-semibold">AI翻译</span>
              </div>
            </div>
            <div className="collapse-content bg-base-100">
              <div className="pt-2">
                <div>{aiTranslatedText}</div>

                <div className="flex justify-end">
                  <button
                    className="btn btn-ghost"
                    disabled={aiTranslatedText == ""}
                  >
                    <RiFileCopyLine className="text-xl" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {translationData.map((item) => (
          <div
            className={`collapse collapse-arrow ${
              aiData ? "" : "collapse-open"
            } bg-base-300 border-base-300 border`}
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

                <div className="flex justify-end">
                  <button
                    className="btn btn-ghost"
                    disabled={item.translatedText == ""}
                  >
                    <RiFileCopyLine className="text-xl" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
