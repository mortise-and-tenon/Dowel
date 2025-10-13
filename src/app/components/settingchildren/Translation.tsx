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

type TranslationProvider = {
  name: string;
  i18nName: string;
  logo: ReactNode;
  link?: string;
  need_api: boolean;
  api: string;
  key: string;
  secret: string;
  on: boolean;
};

/**
 * 翻译厂商默认信息
 */
const defaultTranslations: TranslationProvider[] = [
  {
    name: "aliyun",
    i18nName: "translation.provider.aliyun",
    logo: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 4608 1024"
        fill="#ff6a00"
        width="80"
      >
        <path d="M3266.56 773.12h327.68v-102.4h-327.68v-102.4H3584V35.84H2846.72v532.48h317.44v102.4h-327.68v102.4h327.68v112.64h-353.28v102.4h814.08v-102.4h-353.28v-112.64zM3276.8 138.24h215.04v112.64H3276.8V138.24z m0 215.04h215.04V460.8H3276.8V353.28zM3174.4 460.8h-215.04V353.28H3174.4V460.8z m0-209.92h-215.04V138.24H3174.4v112.64zM537.6 445.44H1075.2v122.88H537.6z"></path>
        <path d="M1341.44 5.12h-353.28L1075.2 128l256 81.92c46.08 15.36 76.8 61.44 76.8 107.52v389.12c0 46.08-30.72 92.16-76.8 107.52l-256 81.92-87.04 122.88h353.28c148.48 0 266.24-117.76 266.24-266.24V276.48c0-148.48-117.76-271.36-266.24-271.36zM276.48 814.08c-46.08-15.36-76.8-61.44-76.8-107.52V317.44c0-46.08 30.72-92.16 76.8-107.52l256-81.92L619.52 5.12H266.24C117.76 5.12 0 128 0 276.48v471.04c0 148.48 117.76 266.24 266.24 266.24h353.28l-87.04-122.88-256-76.8zM2493.44 250.88h-261.12v537.6h261.12V250.88z m-107.52 430.08h-56.32V353.28h56.32v327.68zM1848.32 988.16h102.4V138.24h107.52L1996.8 419.84v102.4h61.44v225.28c0 15.36-10.24 25.6-25.6 25.6h-25.6v102.4h51.2c56.32 0 102.4-46.08 102.4-102.4v-358.4H2099.2l61.44-281.6v-102.4h-312.32v957.44z"></path>
        <path d="M2206.72 138.24H2560v660.48c0 46.08-35.84 87.04-87.04 87.04h-76.8v102.4h107.52c87.04 0 163.84-71.68 163.84-163.84V138.24h35.84v-102.4h-496.64v102.4zM3763.2 40.96h737.28v102.4H3763.2zM4541.44 527.36v-102.4H3727.36v102.4h204.8l-163.84 358.4v102.4h691.2c30.72 0 51.2-25.6 51.2-51.2 0-10.24 0-15.36-5.12-20.48l-87.04-194.56h-112.64l76.8 163.84h-496.64l163.84-358.4h491.52z"></path>
      </svg>
    ),
    link: "https://mt.console.aliyun.com/basic",
    need_api: true,
    api: "",
    key: "",
    secret: "",
    on: false,
  },
  {
    name: "baidu",
    i18nName: "translation.provider.baidu",
    logo: (
      <img
        src="https://home.baidu.com/Public/img/logo.png?v=15"
        alt="baidu_logo"
      />
    ),
    link: "https://fanyi-api.baidu.com/product/11",
    need_api: false,
    api: "",
    key: "",
    secret: "",
    on: false,
  },
];

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
      const resultData = defaultTranslations.map((a: TranslationProvider) => {
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
                <div className="flex items-center w-20">{item.logo}</div>
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
