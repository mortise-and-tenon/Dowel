"use client";

import { I18nContext } from "@/app/utils/providers/I18nProvider";
import { ProviderData, PlatformAdapter, TauriAdapter } from "@/app/utils/utils";
import { useEffect } from "react";
import { useContext } from "react";
import { useState } from "react";
import { ReactNode } from "react";
import {
  MdAdd,
  MdOutlineSearch,
  MdToggleOff,
  MdToggleOn,
} from "react-icons/md";
import ContainerModal from "../ContainerModal";
import { useRef } from "react";
import { RiRefreshLine, RiToggleFill } from "react-icons/ri";
import { IoMdCheckmarkCircle, IoMdEye, IoMdEyeOff } from "react-icons/io";
import { AiUtils } from "@/app/utils/aiUtils";
import { FaTimesCircle } from "react-icons/fa";
import { FaCircleCheck } from "react-icons/fa6";
import { use } from "react";

/**
 * 模型信息定义
 */
type AiModelData = {
  name: string;
  icon: ReactNode;
  i18nName: string;
  api: string;
  key: string;
  on: boolean;
};

export default function Ai() {
  const { i18n } = useContext(I18nContext);

  /**
   * 系统层工具
   */
  const adapter: PlatformAdapter = new TauriAdapter();

  /**
   * 访问 AI 相关接口工具
   */
  const aiUtils: AiUtils = new AiUtils();

  /**
   * 获取的供应商列表
   */
  const [providers, setProviders] = useState<ProviderData[]>([]);

  /**
   * 选中的供应商
   */
  const [focusProvider, setFocusProvider] = useState<ProviderData>();

  /**
   * 供应商过滤条件
   */
  const [filterCondition, setFilterCondition] = useState("");

  /**
   * 是否展示添加供应商对话框
   */
  const [showModal, setShowModal] = useState(false);

  /**
   * 添加供应商对话框确定按钮，是否可用
   */
  const [enableAdd, setEnabledAdd] = useState(false);

  /**
   * 新添加供应商的名称
   */
  const [newProviderName, setNewProviderName] = useState("");

  /**
   * 供应商开关状态
   */
  const [toggleState, setToggleState] = useState(false);

  /**
   * 填写的新的供应商 API
   */
  const [newApi, setNewApi] = useState("");

  /**
   * 填写的新的供应商 Key
   */
  const [newKey, setNewKey] = useState("");

  /**
   * 隐藏密钥
   */
  const [hideKey, setHideKey] = useState(true);

  /**
   * 检测结果信息
   */
  const [checkResult, setCheckResult] = useState({
    success: true,
    msg: "",
  });

  /**
   * 禁用按钮
   */
  const [disabledBtn, setDisabledBtn] = useState(true);

  useEffect(() => {
    readProviders();
  }, []);

  /**
   * 读取所有供应商数据
   */
  const readProviders = async () => {
    const data = await adapter.readProviders();
    setProviders(data);
    if (!focusProvider) {
      setFocusProvider(data[0]);
    }
  };

  /**
   * 选中指定的模型
   * @param item
   */
  const onClickModel = (item: ProviderData) => {
    setFocusProvider(item);
    setNewApi(item.api ? item.api : "");
    setNewKey(item.key ? item.key : "");
    setToggleState(item.on ? item.on : false);
  };

  /**
   * 展示添加供应商模态框
   */
  const onShowModal = () => {
    setShowModal(true);
  };

  /**
   * 隐藏添加供应商模态框
   */
  const onHideModal = () => {
    setShowModal(false);
    setNewProviderName("");
  };

  /**
   * 动态过滤供应商
   * @param e
   */
  const onSearchProvider = (e: any) => {
    const value = e.target.value;
    setFilterCondition(value);
  };

  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * 模态框展示时，焦点自动到输入框
   */
  useEffect(() => {
    if (showModal && inputRef.current) {
      // 稍微延迟确保Modal已完全渲染
      const timer = setTimeout(() => {
        if (inputRef.current !== null) {
          inputRef.current.focus();
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [showModal]);

  /**
   * 确定添加供应商
   */
  const onAddProvider = async () => {
    if (newProviderName != null && newProviderName != "") {
      try {
        await adapter.writeProviderData({
          name: newProviderName,
          api: "",
          key: "",
          on: false,
        });
        setShowModal(false);
        await readProviders();
      } catch (error) {}
    } else {
    }
  };

  /**
   * 输入供应商名称
   * @param e
   */
  const onInputProviderName = (e: any) => {
    setEnabledAdd(e.target.value != "");
    setNewProviderName(e.target.value);
  };

  /**
   * 启用/停用供应商
   * @param e
   */
  const onSwitch = async (e: any) => {
    setToggleState(e.target.checked);
    if (focusProvider != undefined) {
      const provider = {
        name: focusProvider?.name,
        on: e.target.checked,
      };
      try {
        await adapter.writeProviderData(provider);
        await readProviders();
      } catch (error) {}
    }
  };

  /**
   * 输入供应商 API
   * @param e
   */
  const onChangeApi = (e: any) => {
    const value = e.target.value;
    setNewApi(value);
    //重置提示
    setCheckResult({ success: true, msg: "" });
  };

  /**
   * 输入供应商密钥
   * @param e
   */
  const onChangeKey = (e: any) => {
    const value = e.target.value;
    setNewKey(value);
    //重置提示
    setCheckResult({ success: true, msg: "" });
  };

  useEffect(() => {
    const enabled =
      newApi != undefined &&
      newApi != "" &&
      newKey != undefined &&
      newKey != "";
    setDisabledBtn(!enabled);
  }, [newApi, newKey]);

  /**
   * 隐藏或显示密钥
   */
  const onShowOrHideKey = () => {
    setHideKey((pre) => !pre);
  };

  /**
   * 检测供应商配置是否能访问
   */
  const onCheckProvider = async () => {
    try {
      const resp = await aiUtils.getModels(newApi, newKey);
      setCheckResult({
        success: resp.success,
        msg: resp.msg,
      });
    } catch (error) {
      setCheckResult({
        success: false,
        msg: "http.fail",
      });
    }
  };

  /**
   * api 输入框对象
   */
  const apiInputRef = useRef<HTMLInputElement>(null);

  /**
   * 保存供应商配置
   */
  const onSaveProvider = async () => {
    if (focusProvider != undefined) {
      const provider = {
        name: focusProvider?.name,
        api: newApi,
        key: newKey,
        on: toggleState,
      };
      try {
        await adapter.writeProviderData(provider);
        await readProviders();
      } catch (error) {}
    }
  };

  return (
    <div className="grid grid-cols-3 bg-base-100 h-full">
      <div className="border-r-2 border-base-300 pt-2 px-2 flex flex-col h-full min-h-0">
        <label className="input">
          <input
            type="search"
            className="grow"
            placeholder="搜索供应商"
            onChange={onSearchProvider}
          />
          <MdOutlineSearch className="text-2xl" />
        </label>
        <div className="flex-1 min-h-0 w-full overflow-y-auto hide-scrollbar">
          <ul className="menu w-full px-0">
            {providers
              .filter((item) => item.name.includes(filterCondition))
              .map((item) => (
                <li key={item.name} onClick={() => onClickModel(item)}>
                  <div
                    className={`flex items-center justify-between ${
                      item.name === focusProvider?.name && "menu-active"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        {item.name.substring(0, 1)}
                      </div>
                      <span>{item.name}</span>
                    </div>
                    {item.on && (
                      <MdToggleOn className="text-2xl text-success" />
                    )}
                  </div>
                </li>
              ))}
          </ul>
        </div>
        <button className="btn mb-2" onClick={onShowModal}>
          <MdAdd className="text-2xl" />
          添加供应商
        </button>
        <dialog
          id="addModal"
          className={`modal ${showModal ? "modal-open" : ""} `}
        >
          <div className="modal-box">
            <div role="alert" className="alert alert-error">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 shrink-0 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Error! Task failed successfully.</span>
            </div>
            <h3 className="font-bold text-lg">添加供应商</h3>
            <div className="py-4">
              <form method="dialog">
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">名称</legend>
                  <input
                    ref={inputRef}
                    type="text"
                    className="input w-full"
                    placeholder="输入供应商名称"
                    value={newProviderName}
                    onChange={onInputProviderName}
                  />
                </fieldset>
              </form>
            </div>
            <div className="modal-action">
              <button className="btn" onClick={onHideModal}>
                取消
              </button>
              <button
                className={`btn btn-primary ${enableAdd ? "" : "btn-disabled"}`}
                onClick={onAddProvider}
              >
                确定
              </button>
            </div>
          </div>
        </dialog>
      </div>
      <div className="col-span-2 p-4  overflow-y-auto hide-scrollbar">
        <div className="flex justify-between pb-2">
          <span>{focusProvider?.name}</span>
          <input
            type="checkbox"
            checked={toggleState}
            onChange={onSwitch}
            className="toggle toggle-success"
          />
        </div>
        <hr className="border-base-300" />
        <fieldset className="fieldset">
          <legend className="fieldset-legend">API 地址</legend>
          <input
            type="url"
            ref={apiInputRef}
            className="input validator w-full"
            value={newApi}
            required
            onChange={onChangeApi}
            placeholder="API 地址"
          />
          <p className="label">/v1/chat/completions</p>
        </fieldset>
        <fieldset className="fieldset">
          <legend className="fieldset-legend">API 密钥</legend>
          <div className="join">
            <input
              type={hideKey ? "password" : "text"}
              className="input w-full"
              value={newKey}
              required
              onChange={onChangeKey}
              placeholder="API 密钥"
            />
            <button className="btn" onClick={onShowOrHideKey}>
              {hideKey ? <IoMdEyeOff /> : <IoMdEye />}
            </button>
          </div>
        </fieldset>
        {checkResult.msg && (
          <div
            role="alert"
            className={`alert ${
              checkResult.success ? "alert-success" : "alert-error"
            } `}
          >
            {checkResult.success ? (
              <FaCircleCheck className="text-2xl" />
            ) : (
              <FaTimesCircle className="text-2xl" />
            )}
            <span>{i18n(checkResult.msg)}</span>
          </div>
        )}
        <div className="flex justify-end pt-2 space-x-2">
          <button
            className={`btn ${
              (disabledBtn || !apiInputRef.current?.validity.valid) &&
              "btn-disabled"
            }`}
            onClick={onCheckProvider}
          >
            检测
          </button>
          <button
            className={`btn btn-primary ${
              (disabledBtn || !apiInputRef.current?.validity.valid) &&
              "btn-disabled"
            }`}
            onClick={onSaveProvider}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
