"use client";
import { AiUtils } from "@/app/utils/aiUtils";
import { I18nContext } from "@/app/utils/providers/I18nProvider";
import { TranslateUtils } from "@/app/utils/translateUtils";
import { AliTranslation } from "@/app/utils/translations/aliTranslation";
import { BaiduTranslation } from "@/app/utils/translations/baiduTranslation";
import {
  CommonLangCode,
  DefaultTranslations,
  LangCode,
  TranslationInterface,
  User_Msg_Format,
} from "@/app/utils/translations/translationInferace";
import { AiData, TauriAdapter, TranslationData } from "@/app/utils/utils";
import { useRef } from "react";
import { ReactNode, useContext, useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { GoArrowSwitch } from "react-icons/go";
import { MdAutoAwesome, MdOutlineTranslate } from "react-icons/md";
import { RiFileCopyLine } from "react-icons/ri";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight"; // 代码高亮
import "highlight.js/styles/github-dark.css"; // 代码高亮主题

type TranslationDisplay = {
  name: string;
  ai: boolean;
  i18nName: string;
  logo: ReactNode;
  loading: boolean;
  translatedText: string;
};

export default function Translation() {
  const { i18n, locale } = useContext(I18nContext);

  const adapter = new TauriAdapter();

  const aiUtils = new AiUtils();

  const translateUtils = new TranslateUtils();

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

    let resultData: TranslationDisplay[] = [];
    if (data.length > 0) {
      resultData = data
        .filter((item) => item.on)
        .map((a: TranslationData) => {
          const b = DefaultTranslations.find(
            (item: TranslationData) => item.name === a.name
          );
          if (b) {
            return {
              name: b.name,
              ai: false,
              i18nName: b.i18nName,
              logo: b.logo,
              loading: false,
              translatedText: "",
            };
          }
          return null;
        })
        .filter((item) => item != null);
    }

    const aiData = await adapter.readAiData("translation");
    if (aiData && aiData.on) {
      setAiData(aiData);
      resultData = [
        {
          name: aiData.name,
          ai: true,
          i18nName: "translation.ai_translate",
          logo: <MdAutoAwesome className="text-primary" />,
          loading: false,
          translatedText: "",
        },
        ...resultData,
      ];
    }

    setTranslationData(resultData);
  };

  /**
   * 点击翻译按钮
   */
  const onTranslate = async () => {
    try {
      setTranslationData((pre) => {
        const newData = pre.map((data, index) => {
          return {
            ...data,
            loading: true,
          };
        });
        return newData;
      });

      const taskResults: string[] = await Promise.all(
        translationData.map((item) => {
          if (item.ai && aiData) {
            try {
              const msg = User_Msg_Format.replace(
                "$target_txt",
                target
              ).replace("$original_txt", originalText);
              return aiUtils
                .singleCompletions(aiData.name, msg)
                .then((result) => {
                  if (result.success) {
                    return result.data;
                  }
                });
            } catch (error) {
              console.error("ai translate error:", error);
              return "";
            }
          } else {
            return translationInstances[item.name]
              .translate(originalText, source, target)
              .then((result) => result.translated);
          }
        })
      );

      setTranslationData((pre) => {
        const newData = pre.map((data, index) => {
          return {
            ...data,
            translatedText: taskResults[index],
            loading: false,
          };
        });
        return newData;
      });
    } catch (error: any) {
      console.error("翻译失败:", error.message);
    }
  };

  /**
   * AI 独立的译文
   */
  const [aiTranslatedText, setAiTranslatedText] = useState("");

  /**
   * AI 独立翻译加载状态
   */
  const [aiLoading, setAiLoading] = useState(false);

  /**
   * 独立的AI翻译
   */
  const onAiTranslate = async () => {
    try {
      setAiLoading(true);
      // 调用流式工具函数（严格匹配参数类型）
      await aiUtils.singleStreamCompletions({
        target: target,
        message: originalText,
        ai_name: aiData ? aiData.name : "",
        onChunk: (content: string) => {
          flushSync(() => {
            setAiTranslatedText((pre) => pre + content);
          });
        },
        onComplete: () => {
          setAiLoading(false);
        },
        onError: (error: Error) => {
          setAiLoading(false);
        },
      });
    } catch (error: any) {
      console.error("翻译失败:", error.message);
    }
  };

  const translateTextRefs = useRef<Record<number, HTMLDivElement | null>>({});

  /**
   * 复制指定的译文
   * @param itemId
   * @returns
   */
  const onCopy = async (itemId: number) => {
    const targetDiv = translateTextRefs.current[itemId];
    if (!targetDiv) {
      return;
    }

    try {
      const textToCopy = targetDiv.textContent || "";
      if (!textToCopy.trim()) throw new Error("内容为空");

      await navigator.clipboard.writeText(textToCopy);
    } catch (err) {
      console.error(`复制 id=${itemId} 失败:`, err);
    }
  };

  /**
   * 复制AI翻译网页的译文
   */
  const onCopyAi = async () => {
    try {
      await navigator.clipboard.writeText(aiTranslatedText);
    } catch (err) {
      console.error(`复制失败:`, err);
    }
  };

  /**
   * 输入原文
   * @param e
   */
  const onChangeOriginal = (e: any) => {
    setOriginalText(e.target.value);

    setEnableBtn(e.target.value != "");

    const value = translateUtils.isUrl(e.target.value);
    setIsUrl(value);
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

  /**
   * 翻译内容是否为Url
   */
  const [isUrl, setIsUrl] = useState(false);

  /**
   * 是否展示为markdown风格
   */
  const [showMd, setShowMd] = useState(true);

  /**
   * 切换markdown展示
   * @param e
   */
  const onChangeShowMd = (e: any) => {
    setShowMd(e.target.checked);
  };

  return (
    <div className="flex w-full h-full">
      <div className="flex-1 p-4">
        <textarea
          className="textarea h-60 max-h-60 w-full focus:outline-none"
          ref={sourceTextRef}
          placeholder={i18n("translation.original")}
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
          {!isUrl ? (
            <button
              className="btn btn-outline btn-primary ml-2"
              onClick={onTranslate}
              disabled={!enableBtn}
            >
              <MdOutlineTranslate className="text-2xl" />
            </button>
          ) : (
            <button
              className="btn btn-outline btn-primary ml-2"
              onClick={onAiTranslate}
              disabled={!enableBtn}
            >
              <MdOutlineTranslate className="text-lg" />
              AI
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 max-w-[50%] p-4 space-y-2 overflow-y-auto hide-scrollbar">
        {isUrl && (
          <div
            className={`collapse collapse-arrow collapse-open bg-base-300 border-base-300 border`}
          >
            <div className="collapse-title bg-base-200">
              <div className="flex items-center">
                <div className="w-20 flex justify-center">
                  {translationData[0].logo}
                </div>
                <span className="pl-2 font-semibold">
                  {i18n(translationData[0].i18nName)}
                </span>
              </div>
            </div>
            <div className="collapse-content bg-base-100 min-w-0">
              <div className="pt-2 w-full">
                {showMd ? (
                  <div className="break-all max-h-40 w-full overflow-y-auto">
                    <div className="pointer-events-none">
                      <ReactMarkdown
                        // 启用代码高亮
                        rehypePlugins={[rehypeHighlight]}
                        // 处理空内容
                        children={aiTranslatedText || ""}
                      />
                    </div>
                  </div>
                ) : (
                  <div
                    className="break-all max-h-40 overflow-y-auto"
                    ref={(el: HTMLDivElement | null) => {
                      translateTextRefs.current[0] = el;
                    }}
                  >
                    {aiTranslatedText}
                  </div>
                )}

                {aiLoading && (
                  <div className="loading loading-dots text-primary"></div>
                )}

                <div className="flex justify-between">
                  <label className="label">
                    <input
                      type="checkbox"
                      checked={showMd}
                      onChange={onChangeShowMd}
                      className="toggle toggle-primary"
                    />
                    Markdown
                  </label>
                  <button
                    className="btn btn-ghost btn-primary"
                    disabled={aiTranslatedText == ""}
                    onClick={onCopyAi}
                  >
                    <RiFileCopyLine className="text-lg" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {!isUrl &&
          translationData.map((item, index) => (
            <div
              className={`collapse collapse-arrow ${
                index == 0 && "collapse-open"
              } w-full bg-base-300 border-base-300 border`}
              key={item.name}
            >
              <input type="checkbox" />
              <div className="collapse-title bg-base-200">
                <div className="flex items-center">
                  <div className="w-20 flex justify-center">{item.logo}</div>
                  <span className="pl-2 font-semibold">
                    {i18n(item.i18nName)}
                  </span>
                </div>
              </div>
              <div className="w-full collapse-content bg-base-100">
                <div className="pt-2">
                  {item.loading ? (
                    <div className="loading loading-dots text-primary"></div>
                  ) : (
                    <div
                      className="break-all max-h-40 overflow-y-auto"
                      ref={(el: HTMLDivElement | null) => {
                        translateTextRefs.current[index] = el;
                      }}
                    >
                      {item.translatedText}
                    </div>
                  )}
                  {item.ai && (
                    <div
                      className="break-all max-h-40 overflow-y-auto"
                      ref={(el: HTMLDivElement | null) => {
                        translateTextRefs.current[index] = el;
                      }}
                    >
                      {item.translatedText}
                    </div>
                  )}
                  {aiLoading && (
                    <div className="loading loading-dots text-primary"></div>
                  )}

                  <div className="flex justify-end">
                    <button
                      className="btn btn-ghost btn-primary"
                      disabled={item.translatedText == ""}
                      onClick={(e) => onCopy(index)}
                    >
                      <RiFileCopyLine className="text-lg" />
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
