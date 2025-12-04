"use client";
import { AiUtils } from "@/app/utils/aiUtils";
import { GlobalContext } from "@/app/utils/providers/GlobalProvider";
import { TranslateUtils } from "@/app/utils/translateUtils";
import {
  CommonLangCode,
  DefaultTranslations,
  translationInstances,
  User_Msg_Format,
} from "@/app/utils/translations/translationInferace";
import { AiData, TauriAdapter, TranslationData } from "@/app/utils/utils";
import { useRouter } from "next/navigation";
import { ReactNode, useContext, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useTranslation } from "react-i18next";
import { GoArrowSwitch } from "react-icons/go";
import { MdAutoAwesome, MdCheck, MdOutlineTranslate } from "react-icons/md";
import { RiFileCopyLine } from "react-icons/ri";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";

type TranslationDisplay = {
  name: string;
  ai: boolean;
  i18nName: string;
  logo: ReactNode;
  loading: boolean;
  translatedText: string;
  display: boolean;
};

/**
 * 翻译页面
 * @returns
 */
export default function Translation() {
  const { appConfig } = useContext(GlobalContext);
  const { t } = useTranslation();

  const router = useRouter();

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

  /**
   * 数据加载状态
   */
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    const data: TranslationData[] = await adapter.readTranslations();

    let resultData: TranslationDisplay[] = [];
    if (data.length > 0) {
      resultData = data
        .filter((item) => item.on)
        .map((a: TranslationData, index) => {
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
              display: index == 0,
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
          display: true,
        },
        ...resultData,
      ];
    }

    setTranslationData(resultData);
    setLoading(false);
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
              .then((result) => {
                updateUsed(item.name, result.original.length);
                return result.translated;
              });
          }
        })
      );

      setTranslationData((pre) => {
        const newData = pre.map((data, index) => {
          return {
            ...data,
            translatedText: taskResults[index],
            loading: false,
            display: true,
          };
        });
        return newData;
      });
    } catch (error: any) {
      console.error("翻译失败:", error.message);
    }
  };

  //更新字符用量
  const updateUsed = async (providerName: string, newNum: number) => {
    const provider = await adapter.readTranslation(providerName);
    if (provider) {
      const used = provider?.used ? provider.used : 0 + newNum;
      await adapter.writeTranslation({
        ...provider,
        used: used,
      });
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
      setAiTranslatedText("");
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

  //点击的复制按钮的id，有于变换图标
  const [copyTextId, setCopyTextId] = useState(-1);

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
      setCopyTextId(itemId);
      setTimeout(() => {
        setCopyTextId(-1);
      }, 1000);
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
      setCopyTextId(0);
      setTimeout(() => {
        setCopyTextId(-1);
      }, 1000);
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
  const [target, setTarget] = useState(appConfig.locale);

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

  /**
   * 切换源、目标语言
   */
  const onSwitchLang = () => {
    if (source != "auto") {
      const preSource = source;
      setSource(target);
      setTarget(preSource);
    }
  };

  /**
   * 点击展示/隐藏各供应商翻译折叠区域
   * @param index
   */
  const onDisplay = (index: number) => {
    setTranslationData((pre) => {
      return pre.map((item, i) => {
        return {
          ...item,
          display: i == index ? !item.display : item.display,
        };
      });
    });
  };

  const onNagviteSetting = () => {
    router.push("/setting?menu=translation");
  };

  return (
    <div className="flex w-full h-full">
      {loading ? (
        <div className="flex-1 p-4">
          <div className="flex space-x-2">
            <div className="flex-1 space-y-2">
              <div className="skeleton h-64 bg-base-200"></div>
              <div className="skeleton h-12  bg-base-200"></div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="skeleton h-16 bg-base-200"></div>
              <div className="skeleton h-16 bg-base-200"></div>
              <div className="skeleton h-16 bg-base-200"></div>
            </div>
          </div>
        </div>
      ) : translationData.length > 0 ? (
        <>
          <div className="flex-1 p-4">
            <textarea
              className="textarea h-60 max-h-60 w-full focus:outline-none"
              ref={sourceTextRef}
              placeholder={t("translation.original")}
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
                  <option value="auto">{t("langs.auto")}</option>
                  {CommonLangCode.map((item) => (
                    <option key={`source-${item}`} value={item}>
                      {t(`langs.${item}`)}
                    </option>
                  ))}
                </select>

                <button
                  className="btn btn-ghost"
                  onClick={onSwitchLang}
                  disabled={source === "auto"}
                >
                  <GoArrowSwitch />
                </button>
                <select
                  className="select focus:outline-none"
                  value={target}
                  onChange={onSelectTarget}
                >
                  {CommonLangCode.map((item) => (
                    <option key={`target-${item}`} value={item}>
                      {t(`langs.${item}`)}
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
                  disabled={!enableBtn || aiLoading || !translationData[0].ai}
                >
                  <MdOutlineTranslate className="text-lg" />
                  AI
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 max-w-[50%] p-4 space-y-2 overflow-y-auto hide-scrollbar">
            {isUrl && translationData[0].ai && (
              <div
                className={`collapse collapse-arrow collapse-open bg-base-300 border-base-300 border`}
                key={translationData[0].name}
              >
                <div className="collapse-title bg-base-200">
                  <div className="flex items-center">
                    <div className="w-20 flex justify-center">
                      {translationData[0].logo}
                    </div>
                    <span className="pl-2 font-semibold">
                      {t(translationData[0].i18nName)}
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
                        {copyTextId == 0 ? (
                          <MdCheck className="text-lg" />
                        ) : (
                          <RiFileCopyLine className="text-lg" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {isUrl && !translationData[0].ai && (
              <div className="hero ">
                <div className="hero-content text-center">
                  <div className="max-w-md">
                    <p className="py-6">{t("translation.setting_ai_guide")}</p>
                    <button
                      className="btn btn-primary"
                      onClick={onNagviteSetting}
                    >
                      {t("translation.setting_tip")}
                    </button>
                  </div>
                </div>
              </div>
            )}
            {!isUrl &&
              translationData.map((item, index) => (
                <div
                  className={`collapse collapse-arrow w-full bg-base-300 border-base-300 border`}
                  key={item.name}
                >
                  <input
                    type="checkbox"
                    checked={item.display}
                    onChange={(e) => onDisplay(index)}
                  />
                  <div className="collapse-title bg-base-200">
                    <div className="flex items-center">
                      <div className="w-20 flex justify-center">
                        {item.logo}
                      </div>
                      <span
                        className={`pl-2 text-base-content font-bold ${
                          item.loading && "animate-bounce"
                        }`}
                      >
                        {t(item.i18nName)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full collapse-content bg-base-100">
                    <div className="pt-2">
                      {item.loading ? (
                        <div className="loading loading-dots text-primary"></div>
                      ) : (
                        <div
                          className="break-all max-h-40 overflow-y-auto "
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
                          {copyTextId == index ? (
                            <MdCheck className="text-lg" />
                          ) : (
                            <RiFileCopyLine className="text-lg" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </>
      ) : (
        <div className="hero ">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <p className="py-6">{t("translation.setting_guide")}</p>
              <button className="btn btn-primary" onClick={onNagviteSetting}>
                {t("translation.setting_tip")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
