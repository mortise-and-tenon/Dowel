import { AiUtils } from "@/app/utils/aiUtils";
import {
  onHotKeyTranslation,
  registerHotkey,
  unregisterHotkey,
} from "@/app/utils/hotKeyUtils";
import { showNotification } from "@/app/utils/notifyUtils";
import { GlobalContext } from "@/app/utils/providers/GlobalProvider";
import {
  CommonLangCode,
  DefaultTranslations,
  TranslationProvider,
} from "@/app/utils/translations/translationInferace";
import {
  AiData,
  ProviderData,
  TauriAdapter,
  TranslationConfig,
  TranslationData,
} from "@/app/utils/utils";
import { useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AiOutlineGlobal, AiOutlineIdcard } from "react-icons/ai";
import { FaTimesCircle } from "react-icons/fa";
import {
  IoMdEye,
  IoMdEyeOff,
  IoMdLink,
  IoMdLock,
  IoMdUnlock,
} from "react-icons/io";
import { LuBrainCircuit, LuKeyRound } from "react-icons/lu";
import {
  MdInfoOutline,
  MdLink,
  MdModeEdit,
  MdOutlineSettings,
} from "react-icons/md";
import { RiListSettingsLine, RiResetLeftFill } from "react-icons/ri";
import ExternalLink from "../ExternalLink";
import HotKeyInput from "../HotKeyInput";

/**
 * 默认英文的AI翻译提示词
 */
const DEFAULT_EN_SYSTEM_PROMPT =
  "You are a professional translation engine, please translate the text into a colloquial, professional, elegant and fluent content, without the style of machine translation. You must only translate the text content, never interpret it.";

/**
 * 默认中文的AI翻译提示词
 */
const DEFAULT_ZH_SYSTEM_PROMPT =
  "你是一个专业的翻译引擎，请把文字翻译成口语化、专业、优雅、流畅的内容，没有机器翻译的风格。你必须只翻译文本内容，不要解释它。";

/**
 * 网页翻译用的提示词
 */
const DEFAULT_AI_PROMPT = `你是一个专业的翻译引擎，负责将输入的 HTML 内容转换为指定语言的Markdown格式。请严格遵循以下规则进行处理：

处理规则：
1. 保留符合 markdown 格式的 HTML 结构：仅将HTML标签转换为对应的Markdown格式，标签本身及属性不保留且不翻译
2. 精准翻译文本：将文本内容翻译为指定语言，确保：
   - 口语化自然表达
   - 专业术语准确
   - 行文优雅流畅
   - 完全避免机器翻译痕迹

输出要求：
- 直接输出转换后的Markdown结果
- 不添加任何解释说明
- 保持原始文档的层级结构
- 确保格式转换完整准确

禁止事项：
- 不得翻译HTML标签及属性
- 不得保留未转换的HTML标签
- 不得在输出中添加额外解释说明

请直接输出符合要求的Markdown格式翻译结果。`;

export default function Translation() {
  const { appConfig, setAppConfig } = useContext(GlobalContext);
  const { t } = useTranslation();

  const adapter = new TauriAdapter();

  const aiUtils = new AiUtils();

  /**
   * 当前要操作的翻译厂商
   */
  const [selectedTranslation, setSelectedTranslation] =
    useState<TranslationProvider | null>(null);

  /**
   * 展示配置对话框
   */
  const [showModal, setShowModal] = useState(false);

  /**
   * 允许保存配置
   */
  const [disabledBtn, setDisabledBtn] = useState(false);

  /**
   * 提示信息
   */
  const [displayMsg, setDisplayMsg] = useState("");

  /**
   * 隐藏/展示配置的密钥
   */
  const [hideKey, setHideKey] = useState(true);

  /**
   * 翻译厂商数据
   */
  const [translationConfigData, setTranslationConfigData] = useState<
    TranslationProvider[]
  >([]);

  /**
   * 翻译基础配置
   */
  const [translationConfig, setTranslationConfig] = useState<TranslationConfig>(
    { locale: appConfig.locale, hotKey: "" }
  );

  useEffect(() => {
    readTranslations();
    readProviders();
    readAi();
    readTranslationConfig();
  }, []);

  const readTranslations = async () => {
    const data: TranslationData[] = await adapter.readTranslations();
    if (data.length > 0) {
      const resultData = DefaultTranslations.map((a: TranslationProvider) => {
        const b = data.find((item: TranslationData) => item.name === a.name);
        if (b) {
          return {
            ...a,
            api: b.api ? b.api : "",
            key: b.key ? b.key : "",
            secret: b.secret ? b.secret : "",
            on: b.on,
          };
        }
        return { ...a, api: "", key: "", secret: "", on: false };
      });
      setTranslationConfigData(resultData);
    }
  };

  const readTranslationConfig = async () => {
    const config = await adapter.readTranslationConfig();
    setTranslationConfig(config);
  };

  const [newApi, setNewApi] = useState("");

  const [newKey, setNewKey] = useState("");

  const [newSecret, setNewSecret] = useState("");

  useEffect(() => {
    const enabled =
      (selectedTranslation?.need_api
        ? newApi != undefined && newApi != ""
        : true) &&
      newKey != undefined &&
      newKey != "" &&
      newSecret != undefined &&
      newSecret != "";
    setDisabledBtn(!enabled);
  }, [newApi, newKey, newSecret]);

  /**
   * api 输入框对象
   */
  const apiInputRef = useRef<HTMLInputElement>(null);

  /**
   * 点击展示配置对话框
   * @param translation
   */
  const onShowModal = (translation: TranslationProvider) => {
    setSelectedTranslation(translation);
    setNewApi(translation.api);
    setNewKey(translation.key);
    setNewSecret(translation.secret);
    setShowModal(true);
  };

  /**
   * 取消配置对话框
   */
  const onCancelModal = () => {
    setShowModal(false);
  };

  /**
   * 保存对话框配置
   */
  const onConfirmModal = async () => {
    if (selectedTranslation != null && selectedTranslation != undefined) {
      try {
        if (selectedTranslation.need_api) {
          await adapter.writeTranslation({
            name: selectedTranslation.name,
            api: newApi,
            key: newKey,
            secret: newSecret,
            on: selectedTranslation.on,
          });
        } else {
          await adapter.writeTranslation({
            name: selectedTranslation.name,
            key: newKey,
            secret: newSecret,
            on: selectedTranslation.on,
          });
        }
        setShowModal(false);
        setNewApi("");
        setNewKey("");
        setNewSecret("");
        await readTranslations();
      } catch (error) {}
    } else {
    }
  };

  /**
   * 变更表单 API
   * @param e
   */
  const onChangeApi = (e: any) => {
    setNewApi(e.target.value);
  };

  const onChangeKey = (e: any) => {
    setNewKey(e.target.value);
  };

  const onChangeSecret = (e: any) => {
    setNewSecret(e.target.value);
  };

  /**
   * 变更厂商的开启状态
   * @param name
   * @param checked
   */
  const onChangeState = async (name: string, checked: boolean) => {
    const data = translationConfigData.find((item) => item.name === name);

    if (data) {
      setTranslationConfigData((pre: TranslationProvider[]) => {
        pre.map((item) =>
          item.name === name ? { ...item, on: checked } : item
        );
        return pre;
      });
      const newData: TranslationData = {
        name: name,
        on: checked,
      };
      try {
        await adapter.writeTranslation(newData);
        await readTranslations();
      } catch (error) {}
    }
  };

  /**
   * 隐藏或显示密钥
   */
  const onShowOrHideKey = () => {
    setHideKey((pre) => !pre);
  };

  /**
   * 启用的AI供应商数据
   */
  const [providers, setProviders] = useState<ProviderData[]>([]);

  /**
   * 读取所有供应商数据
   */
  const readProviders = async () => {
    const data: ProviderData[] = await adapter.readProviders();
    setProviders(data.filter((item) => item.on));
    setAi((pre) => {
      if (pre.provider === "") {
        return {
          ...pre,
          provider: "default",
          model: "default",
        };
      }
      return pre;
    });
  };

  /**
   * AI翻译配置数据
   */
  const [ai, setAi] = useState<AiData>({
    name: "translation",
    provider: "",
    model: "",
    prompt:
      appConfig.locale === "zh"
        ? DEFAULT_ZH_SYSTEM_PROMPT
        : DEFAULT_EN_SYSTEM_PROMPT,
    web_prompt: DEFAULT_AI_PROMPT,
    web_mode: "text",
    web_selector: "body",
    on: false,
  });

  /**
   * 读取配置的AI数据
   */
  const readAi = async () => {
    const data = await adapter.readAiData("translation");
    if (data) {
      setAi(data);
      setSelector(data.web_selector);
    }
  };

  /**
   * 选择供应商
   */
  const onSelectProvider = (e: any) => {
    setAi((pre) => {
      return {
        ...pre,
        provider: e.target.value,
      };
    });
  };

  /**
   * 选择模型
   */
  const onSelectModel = (e: any) => {
    setAi((pre) => {
      return {
        ...pre,
        model: e.target.value,
      };
    });
  };

  /**
   * 修改提示词内容
   * @param e
   */
  const onChangePrompt = (e: any, type: string) => {
    if (type === "text") {
      setAi((pre) => {
        return {
          ...pre,
          prompt: e.target.value,
        };
      });
    } else if (type === "web") {
      setAi((pre) => {
        return {
          ...pre,
          web_prompt: e.target.value,
        };
      });
    }
  };

  /**
   * AI翻译数据完备后的按钮状态
   */
  const [enabledBtn, setEnabledBtn] = useState(false);

  /**
   * 所有信息配置好了，才能保存
   */
  useEffect(() => {
    const enabled =
      ai.provider != "" &&
      ai.provider != "default" &&
      ai.model != "" &&
      ai.model != "default" &&
      ai.prompt != "";
    setEnabledBtn(enabled);
  }, [ai]);

  /**
   * 模型列表数据
   */
  const [models, setModels] = useState([]);

  /**
   * 当选中的供应商或AI原数据加载后，获取最新的模型列表
   */
  useEffect(() => {
    const provider = providers.find((item) => item.name === ai?.provider);
    queryModels(provider);
  }, [ai.provider]);

  /**
   * 查询供应商对应的模型列表
   */
  const queryModels = async (provider: ProviderData | undefined) => {
    try {
      if (provider && provider.api && provider.key) {
        const resp = await aiUtils.getModels(provider.api, provider.key);
        if (resp.success) {
          setModels(resp.data.data);
        } else {
          setModels([]);
        }
      } else {
        setModels([]);
      }
    } catch (error) {
      setModels([]);
    }
  };

  /**
   * 文本提示词可编辑状态
   */
  const [isTextEdit, setIsTextEdit] = useState(false);

  /**
   * 网页提示词可编辑状态
   */
  const [isWebEdit, setIsWebEdit] = useState(false);

  /**
   * 变更提示词编辑状态
   * @param e
   */
  const onChangeEdit = (e: any, type: string) => {
    if (type === "text") {
      setIsTextEdit(e.target.checked);
    } else if (type === "web") {
      setIsWebEdit(e.target.checked);
    }
  };

  /**
   * 重置提示词为默认
   */
  const onResetPrompt = (type: string) => {
    if (type === "text") {
      setAi((pre) => {
        return {
          ...pre,
          prompt:
            appConfig.locale === "zh"
              ? DEFAULT_ZH_SYSTEM_PROMPT
              : DEFAULT_EN_SYSTEM_PROMPT,
        };
      });
    } else if (type === "web") {
      setAi((pre) => {
        return {
          ...pre,
          web_prompt: DEFAULT_AI_PROMPT,
        };
      });
    }
  };

  /**
   * 开启/关闭AI翻译
   * @param e
   */
  const onToggleAi = (e: any) => {
    setAi((pre) => {
      return {
        ...pre,
        on: e.target.checked,
      };
    });
  };

  /**
   * 保存ai配置
   */
  const onSaveAi = async () => {
    try {
      await adapter.writeAiData(ai);
    } catch (error) {}
  };

  /**
   * 切换网页翻译模式
   * @param e
   */
  const onChangeMode = (e: any) => {
    setAi((pre) => {
      return {
        ...pre,
        web_mode: e.target.value,
      };
    });
  };

  /**
   * 网页选择器值
   */
  const [selector, setSelector] = useState("body");

  /**
   * 输入网页选择器
   * @param e
   */
  const onChangeSelector = (e: any) => {
    setAi((pre) => {
      return {
        ...pre,
        web_selector: e.target.value,
      };
    });

    setSelector(e.target.value);
  };

  const onSaveHotKey = async () => {
    const result = await registerHotkey(translationConfig.hotKey, () => {
      onHotKeyTranslation();
    });

    if (result) {
      await adapter.writeTranslationConfig(translationConfig);
      showNotification("注册热键成功");
    } else {
      showNotification("热键已被占用");
    }
  };

  /**
   * 输入快捷键
   * @param value
   */
  const onChangeShortcut = (value: string) => {
    setTranslationConfig((pre) => {
      return {
        ...pre,
        hotKey: value,
      };
    });
  };

  /**
   * 清除快捷键并注销
   */
  const onCleanHotKey = async () => {
    unregisterHotkey(translationConfig.hotKey);
    setTranslationConfig((pre) => {
      return {
        ...pre,
        hotKey: "",
      };
    });
    await adapter.writeTranslationConfig({
      ...translationConfig,
      hotKey: "",
    });
  };

  /**
   * 切换翻译语言
   * @param e
   */
  const onSelectTarget = (e: any) => {
    setTranslationConfig((pre) => {
      return {
        ...pre,
        locale: e.target.value,
      };
    });
  };

  const onSaveTarget = async () => {
    await adapter.writeTranslationConfig(translationConfig);
  };

  return (
    <div className="p-2 h-full">
      <div className="tabs tabs-lift h-full">
        <label className="tab">
          <input type="radio" name="translate_tabs" defaultChecked />
          <div className="flex items-center space-x-2">
            <AiOutlineGlobal className="text-primary text-lg" />
            <span className="font-semibold">
              {t("translation.web_translate")}
            </span>
          </div>
        </label>
        <div className="tab-content bg-base-100 border-base-300 p-4 overflow-y-auto hide-scrollbar">
          <ul className="list">
            <li className="p-2 text-xs opacity-60 tracking-wide">
              <label className="label">{t("translation.enable")}</label>
            </li>

            {translationConfigData.map((item) => (
              <li className="list-row" key={item.name}>
                <div className="flex items-center justify-center w-20">
                  {item.logo}
                </div>
                <div className="flex">
                  <div className="flex items-center font-semibold">
                    {t(item.i18nName)}
                  </div>
                  {item.link && (
                    <ExternalLink url={item.link}>
                      <IoMdLink className="text-2xl" />
                    </ExternalLink>
                  )}
                </div>

                <button
                  className="btn btn-ghost"
                  onClick={(e) => onShowModal(item)}
                >
                  <MdOutlineSettings className="text-2xl" />
                </button>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={item.on}
                    onChange={(e) => onChangeState(item.name, e.target.checked)}
                    className="toggle toggle-success"
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <dialog
          id="addModal"
          className={`modal ${showModal ? "modal-open" : ""} `}
        >
          <div className="modal-box">
            <h3 className="flex items-center">
              <div className="w-20">
                {selectedTranslation ? selectedTranslation.logo : <></>}
              </div>
              <span className="font-bold text-2xl">
                {t("translation.config")}
              </span>
            </h3>
            <div className="py-4">
              <form method="dialog">
                {selectedTranslation?.need_api && (
                  <>
                    <label className="input validator w-full focus-within:outline-none">
                      <MdLink />
                      <input
                        type="url"
                        ref={apiInputRef}
                        required
                        placeholder="服务接入点"
                        pattern="^(https?://)?([a-zA-Z0-9]([a-zA-Z0-9\-].*[a-zA-Z0-9])?\.)+[a-zA-Z].*$"
                        value={newApi}
                        onChange={onChangeApi}
                      />
                    </label>
                    <p className="validator-hint">
                      {t("translation.url_error_tip")}
                    </p>
                  </>
                )}

                <label className="input w-full mb-4">
                  <AiOutlineIdcard />
                  <input
                    type="text"
                    required
                    placeholder="Access Key Id"
                    value={newKey}
                    onChange={onChangeKey}
                  />
                </label>
                <div className="join w-full">
                  <div className="w-full">
                    <label className="input join-item w-full focus-within:outline-none">
                      <LuKeyRound />
                      <input
                        type={hideKey ? "password" : "text"}
                        required
                        value={newSecret}
                        onChange={onChangeSecret}
                        placeholder="Access Key Secret"
                      />
                    </label>
                  </div>
                  <button className="btn join-item" onClick={onShowOrHideKey}>
                    {hideKey ? <IoMdEyeOff /> : <IoMdEye />}
                  </button>
                </div>
                {displayMsg && (
                  <div role="alert" className="alert alert-error">
                    <FaTimesCircle className="text-2xl" />
                    <span>{t(displayMsg)}</span>
                  </div>
                )}
              </form>
            </div>
            <div className="modal-action">
              <button className="btn" onClick={onCancelModal}>
                {t("common.cancel")}
              </button>
              <button
                className={`btn btn-primary ${
                  (disabledBtn ||
                    (apiInputRef.current &&
                      !apiInputRef.current?.validity.valid)) &&
                  "btn-disabled"
                }`}
                onClick={onConfirmModal}
              >
                {t("common.confirm")}
              </button>
            </div>
          </div>
        </dialog>

        <label className="tab">
          <input type="radio" name="translate_tabs" />
          <div className="flex items-center space-x-2">
            <LuBrainCircuit className="text-primary text-lg" />
            <span className="font-semibold">
              {t("translation.ai_translate")}
            </span>
          </div>
        </label>
        <div className="tab-content bg-base-100 border-base-300 p-6 overflow-y-auto hide-scrollbar">
          <div className="flex justify-end items-center pb-4">
            <div
              className="tooltip tooltip-left"
              data-tip={ai.on ? t("common.enable") : t("common.disable")}
            >
              <input
                type="checkbox"
                className="toggle toggle-success"
                checked={ai.on}
                onChange={onToggleAi}
                disabled={!enabledBtn}
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <label className="select w-full focus-within:outline-none">
              <span className="label">{t("ai.provider")}</span>
              <select value={ai?.provider} onChange={onSelectProvider}>
                <option value={"default"} disabled={true}>
                  {t("ai.select_provider")}
                </option>
                {providers.map((item) => (
                  <option key={item.name} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="select w-full focus-within:outline-none">
              <span className="label">{t("ai.model")}</span>
              <select
                className="select"
                value={ai?.model}
                onChange={onSelectModel}
                disabled={models.length == 0}
              >
                <option value={"default"} disabled={true}>
                  {t("ai.select_model")}
                </option>
                {models.map((item: any) => (
                  <option key={`${item.id}-${item.owned_by}`} value={item.id}>
                    {`${item.id}(${item.owned_by})`}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="pt-4">
            <div className="flex justify-between mb-2">
              <legend className="fieldset-legend">
                {t("ai.prompt")}
                <div>
                  {isTextEdit ? (
                    <IoMdUnlock className="text-lg text-success" />
                  ) : (
                    <IoMdLock className="text-lg text-error" />
                  )}
                </div>
              </legend>
              <div className="flex items-center space-x-2">
                <button
                  className="btn btn-sm btn-soft btn-primary"
                  onClick={(e) => onResetPrompt("text")}
                >
                  <RiResetLeftFill className="text-lg" />
                  {t("common.reset")}
                </button>
                <label className="label">
                  <input
                    type="checkbox"
                    className="toggle toggle-success"
                    checked={isTextEdit}
                    onChange={(e) => onChangeEdit(e, "text")}
                  />
                  <MdModeEdit
                    className={`${isTextEdit ? "text-success" : ""}`}
                  />
                </label>
              </div>
            </div>
            <textarea
              className="textarea h-40 max-h-40 w-full focus:outline-none"
              placeholder={t("ai.input_prompt")}
              value={ai?.prompt}
              onChange={(e) => onChangePrompt(e, "text")}
              disabled={!isTextEdit}
            ></textarea>
          </div>
          <div className="pt-4">
            <div className="flex justify-between mb-2">
              <legend className="fieldset-legend">
                {t("ai.web_prompt")}
                <div>
                  {isTextEdit ? (
                    <IoMdUnlock className="text-lg text-success" />
                  ) : (
                    <IoMdLock className="text-lg text-error" />
                  )}
                </div>
              </legend>
              <div className="flex items-center space-x-2">
                <button
                  className="btn btn-sm btn-soft btn-primary"
                  onClick={(e) => onResetPrompt("web")}
                >
                  <RiResetLeftFill className="text-lg" />
                  {t("common.reset")}
                </button>
                <label className="label">
                  <input
                    type="checkbox"
                    className="toggle toggle-success"
                    checked={isWebEdit}
                    onChange={(e) => onChangeEdit(e, "web")}
                  />
                  <MdModeEdit
                    className={`${isWebEdit ? "text-success" : ""}`}
                  />
                </label>
              </div>
            </div>
            <textarea
              className="textarea h-40 max-h-40 w-full focus:outline-none"
              placeholder={t("ai.input_prompt")}
              value={ai?.web_prompt}
              onChange={(e) => onChangePrompt(e, "web")}
              disabled={!isWebEdit}
            ></textarea>
            <div className="pt-4 space-x-2">
              <label className="select focus-within:outline-none">
                <span className="label">
                  <span>{t("translation.web_mode")}</span>
                  <div
                    className="tooltip tooltip-right"
                    data-tip={t("translation.web_mode_tip")}
                  >
                    <MdInfoOutline />
                  </div>
                </span>
                <select value={ai.web_mode} onChange={onChangeMode}>
                  <option value="text">{t("translation.type_text")}</option>
                  <option value="markdown">
                    {t("translation.type_markdown")}
                  </option>
                </select>
              </label>
              <label className="input focus-within:outline-none">
                <span className="label">
                  <span>{t("translation.web_selector")}</span>
                  <div
                    className="tooltip"
                    data-tip={t("translation.selector_tip")}
                  >
                    <MdInfoOutline />
                  </div>
                </span>
                <input
                  className="input focus:outline-none"
                  value={selector}
                  onChange={onChangeSelector}
                />
              </label>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              className="btn btn-primary"
              onClick={onSaveAi}
              disabled={!enabledBtn}
            >
              {t("common.confirm")}
            </button>
          </div>
        </div>

        <label className="tab">
          <input type="radio" name="translate_tabs" />
          <div className="flex items-center space-x-2">
            <RiListSettingsLine className="text-primary text-lg" />
            <span className="font-semibold">{t("translation.shotcuts")}</span>
          </div>
        </label>
        <div className="tab-content bg-base-100 border-base-300 p-4 overflow-y-auto hide-scrollbar">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1">
              <label className="flex">
                <span className="label mr-2">{t("translation.hotkey")}</span>
                <HotKeyInput
                  value={translationConfig.hotKey}
                  onChange={onChangeShortcut}
                />
              </label>
            </div>
            <div className="col-span-1 space-x-2">
              <button className="btn btn-error" onClick={onCleanHotKey}>
                {t("translation.clear")}
              </button>
              <button className="btn" onClick={onSaveHotKey}>
                {t("translation.register")}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="flex col-span-1">
              <span className="label mr-2">{t("translation.lang")}</span>
              <select
                className="select focus:outline-none"
                value={translationConfig?.locale}
                onChange={onSelectTarget}
              >
                {CommonLangCode.map((item) => (
                  <option key={`target-${item}`} value={item}>
                    {t(`langs.${item}`)}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-1">
              <button className="btn" onClick={onSaveTarget}>
                {t("common.save")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
