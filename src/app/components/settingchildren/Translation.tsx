import { AiOutlineGlobal, AiOutlineIdcard } from "react-icons/ai";
import { HiOutlineServer, HiServer } from "react-icons/hi2";
import { LuBrainCircuit, LuKeyRound } from "react-icons/lu";
import { MdLink, MdModeEdit, MdOutlineSettings } from "react-icons/md";
import ExternalLink from "../ExternalLink";
import { useContext } from "react";
import { I18nContext } from "@/app/utils/providers/I18nProvider";
import { useState } from "react";
import { FaTimesCircle } from "react-icons/fa";
import {
  IoMdEye,
  IoMdEyeOff,
  IoMdLink,
  IoMdLock,
  IoMdUnlock,
} from "react-icons/io";
import {
  AiData,
  ProviderData,
  TauriAdapter,
  TranslationData,
} from "@/app/utils/utils";
import { ReactNode } from "react";
import { useEffect } from "react";
import { useRef } from "react";
import {
  DefaultTranslations,
  TranslationProvider,
} from "@/app/utils/translations/translationInferace";
import { AiUtils } from "@/app/utils/aiUtils";
import { RiResetLeftFill } from "react-icons/ri";

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

export default function Translation() {
  const { i18n, locale } = useContext(I18nContext);

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

  useEffect(() => {
    readTranslations();
    readProviders();
    readAi();
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
      locale === "zh" ? DEFAULT_ZH_SYSTEM_PROMPT : DEFAULT_EN_SYSTEM_PROMPT,
    on: false,
  });

  /**
   * 读取配置的AI数据
   */
  const readAi = async () => {
    const data = await adapter.readAiData("translation");
    if (data) {
      setAi(data);
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
  const onChangePrompt = (e: any) => {
    setAi((pre) => {
      return {
        ...pre,
        prompt: e.target.value,
      };
    });
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
   * 提示词可编辑状态
   */
  const [isEdit, setIsEdit] = useState(false);

  /**
   * 变更提示词编辑状态
   * @param e
   */
  const onChangeEdit = (e: any) => {
    setIsEdit(e.target.checked);
  };

  /**
   * 重置提示词为默认
   */
  const onResetPrompt = () => {
    setAi((pre) => {
      return {
        ...pre,
        prompt:
          locale === "zh" ? DEFAULT_ZH_SYSTEM_PROMPT : DEFAULT_EN_SYSTEM_PROMPT,
      };
    });
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

  return (
    <div className="p-2 h-full">
      <div className="tabs tabs-lift h-full">
        <label className="tab">
          <input type="radio" name="translate_tabs" defaultChecked />
          <AiOutlineGlobal />
          互联网翻译
        </label>
        <div className="tab-content bg-base-100 border-base-300 p-4 overflow-y-auto hide-scrollbar">
          <ul className="list">
            <li className="p-2 text-xs opacity-60 tracking-wide">
              <label className="label">启用平台用于翻译</label>
            </li>

            {translationConfigData.map((item) => (
              <li className="list-row" key={item.name}>
                <div className="flex items-center justify-center w-20">
                  {item.logo}
                </div>
                <div className="flex">
                  <div className="flex items-center font-semibold">
                    {i18n(item.i18nName)}
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
              <span className="font-bold text-2xl">配置</span>
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
                    <p className="validator-hint">URL 格式不正确</p>
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
                    <span>{i18n(displayMsg)}</span>
                  </div>
                )}
              </form>
            </div>
            <div className="modal-action">
              <button className="btn" onClick={onCancelModal}>
                {i18n("common.cancel")}
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
                {i18n("common.confirm")}
              </button>
            </div>
          </div>
        </dialog>

        <label className="tab">
          <input type="radio" name="translate_tabs" />
          <LuBrainCircuit />
          AI翻译
        </label>
        <div className="tab-content bg-base-100 border-base-300 p-6">
          <div className="flex justify-end items-center pb-4">
            <div
              className="tooltip tooltip-left"
              data-tip={ai.on ? "启用" : "停用"}
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
              <span className="label">供应商</span>
              <select value={ai?.provider} onChange={onSelectProvider}>
                <option value={"default"} disabled={true}>
                  选择供应商
                </option>
                {providers.map((item) => (
                  <option key={item.name} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="select w-full focus-within:outline-none">
              <span className="label">模型</span>
              <select
                className="select"
                value={ai?.model}
                onChange={onSelectModel}
                disabled={models.length == 0}
              >
                <option value={"default"} disabled={true}>
                  选择模型
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
                提示词
                <div>
                  {isEdit ? (
                    <IoMdUnlock className="text-lg text-success" />
                  ) : (
                    <IoMdLock className="text-lg text-error" />
                  )}
                </div>
              </legend>
              <div className="flex items-center space-x-2">
                <button
                  className="btn btn-sm btn-soft btn-primary"
                  onClick={onResetPrompt}
                >
                  <RiResetLeftFill className="text-lg" />
                  重置
                </button>
                <label className="label">
                  <input
                    type="checkbox"
                    className="toggle toggle-success"
                    checked={isEdit}
                    onChange={onChangeEdit}
                  />
                  <MdModeEdit className={`${isEdit ? "text-success" : ""}`} />
                </label>
              </div>
            </div>
            <textarea
              className="textarea h-40 max-h-40 w-full focus:outline-none"
              placeholder="填写翻译提示词"
              value={ai?.prompt}
              onChange={onChangePrompt}
              disabled={!isEdit}
            ></textarea>
          </div>
          <div className="flex justify-end mt-4">
            <button
              className="btn btn-primary"
              onClick={onSaveAi}
              disabled={!enabledBtn}
            >
              {i18n("common.confirm")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
