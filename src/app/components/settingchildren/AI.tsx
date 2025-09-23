"use client";

import { I18nContext } from "@/app/utils/providers/I18nProvider";
import { ProviderData, PlatformAdapter, TauriAdapter } from "@/app/utils/utils";
import { useEffect } from "react";
import { useContext } from "react";
import { useState } from "react";
import { ReactNode } from "react";
import { MdAdd, MdOutlineSearch } from "react-icons/md";
import ContainerModal from "../ContainerModal";
import { useRef } from "react";

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

  const adapter: PlatformAdapter = new TauriAdapter();

  const [providers, setProviders] = useState<ProviderData[]>([]);

  /**
   * 选中的供应商
   */
  const [focusProvider, setFocusProvider] = useState<ProviderData>();

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

  return (
    <div className="grid grid-cols-3 bg-base-100 h-full">
      <div className="border-r-2 border-base-300 pt-2 px-2 flex flex-col h-full min-h-0">
        <label className="input">
          <input type="search" className="grow" placeholder="搜索模型平台" />
          <MdOutlineSearch className="text-2xl" />
        </label>
        <div className="flex-1 min-h-0 w-full overflow-y-auto hide-scrollbar">
          <ul className="menu w-full px-0">
            {providers.map((item) => (
              <li key={item.name} onClick={() => onClickModel(item)}>
                <a
                  className={`flex items-center ${
                    item.name === focusProvider?.name && "menu-active"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    {item.name.substring(0, 1)}
                  </div>

                  {item.name}
                  {/* {item.icon}
                  {i18n(item.i18nName)} */}
                </a>
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
      <div className="col-span-2">右侧内容</div>
    </div>
  );
}
