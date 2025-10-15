import { AiOutlineGlobal, AiOutlineIdcard } from "react-icons/ai";
import { HiOutlineServer, HiServer } from "react-icons/hi2";
import { LuBrainCircuit, LuKeyRound } from "react-icons/lu";
import { MdLink, MdOutlineSettings } from "react-icons/md";
import ExternalLink from "../ExternalLink";
import { useContext } from "react";
import { I18nContext } from "@/app/utils/providers/I18nProvider";
import { useState } from "react";
import { FaTimesCircle } from "react-icons/fa";
import { IoMdEye, IoMdEyeOff, IoMdLink } from "react-icons/io";
import { TauriAdapter, TranslationData } from "@/app/utils/utils";
import { ReactNode } from "react";
import { useEffect } from "react";
import { useRef } from "react";
import {
  DefaultTranslations,
  TranslationProvider,
} from "@/app/utils/translations/translationInferace";

export default function Translation() {
  const { i18n } = useContext(I18nContext);

  const adapter = new TauriAdapter();

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
              已支持的厂商
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
                    defaultChecked={item.on}
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
                    <label className="input validator w-full">
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
                    <label className="input join-item w-full">
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
          Tab content 2
        </div>
      </div>
    </div>
  );
}
