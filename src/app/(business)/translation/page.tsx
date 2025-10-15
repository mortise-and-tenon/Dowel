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

export interface LangOption {
  readonly value: string;
  readonly label: ReactNode;
}

interface GroupedOption {
  readonly label: string;
  readonly options: readonly LangOption[];
}

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

  /**
   * 语言列表分组标签
   * @param data
   * @returns
   */
  const langGroupLabel = (data: GroupedOption) =>
    data.label != "" && (
      <div>
        <span>{data.label}</span>
      </div>
    );

  /**
   * 源语言列表项
   */
  const sourceLangs: readonly GroupedOption[] = [
    {
      label: "",
      options: [
        {
          value: "auto",
          label: i18n("langs.auto"),
        },
      ],
    },
    {
      label: "常用语言",
      options: CommonLangCode.map((item) => ({
        value: item,
        label: (
          <div className="">
            <div className="badge badge-outline badge-info mr-2">{item}</div>
            <span>{i18n(`langs.${item}`)}</span>
          </div>
        ),
      })),
    },
    {
      label: "语言列表",
      options: LangCode.map((item) => ({
        value: item,
        label: (
          <div className="">
            <div className="badge badge-outline badge-info mr-2">{item}</div>
            <span>{i18n(`langs.${item}`)}</span>
          </div>
        ),
      })),
    },
  ];

  /**
   * 目录语言列表项
   */
  const targetLangs: readonly GroupedOption[] = [
    {
      label: "常用语言",
      options: CommonLangCode.map((item) => ({
        value: item,
        label: (
          <div className="">
            <div className="badge badge-outline badge-info mr-2">{item}</div>
            <span>{i18n(`langs.${item}`)}</span>
          </div>
        ),
      })),
    },
    {
      label: "语言列表",
      options: LangCode.map((item) => ({
        value: item,
        label: (
          <div className="">
            <div className="badge badge-outline badge-info mr-2">{item}</div>
            <span>{i18n(`langs.${item}`)}</span>
          </div>
        ),
      })),
    },
  ];

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
          <div className="flex w-full">
            <Select<LangOption, false, GroupedOption>
              className="w-full"
              options={sourceLangs}
              defaultValue={sourceLangs[0].options[0]}
              formatGroupLabel={langGroupLabel}
            />
            <button className="btn btn-ghost">
              <GoArrowSwitch />
            </button>
            <Select<LangOption, false, GroupedOption>
              className="w-full"
              options={targetLangs}
              defaultValue={targetLangs[0].options[0]}
              formatGroupLabel={langGroupLabel}
            />
          </div>
          <button
            className="btn btn-ghost btn-primary"
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
