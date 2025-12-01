"use client";
import { APP_VERSION } from "@/app/utils/constants";
import { fetchHttp, RequestOptions } from "@/app/utils/utils";
import { open } from "@tauri-apps/plugin-shell";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AiOutlineGlobal } from "react-icons/ai";
import { ImGithub } from "react-icons/im";
import { MdOutlineFeedback, MdOutlineRssFeed } from "react-icons/md";

/**
 * 新版本号
 */
let newVersion = APP_VERSION;

/**
 * 关于我们页面
 * @returns
 */
export default function About() {
  const { t } = useTranslation();

  /**
   * 点击跳转 GitHub
   * @param e
   */
  const onGitHub = async (e: any) => {
    e.preventDefault();
    try {
      await open("https://github.com/mortise-and-tenon/Dowel");
    } catch (error) {
      console.error("open url fail:", error);
    }
  };

  /**
   * 点击跳转发版信息
   * @param e
   */
  const onRelease = async (e: any) => {
    e.preventDefault();
    try {
      await open("https://dowel.mortnon.tech/docs/releases");
    } catch (error) {
      console.error("open url fail:", error);
    }
  };

  /**
   * 点击跳转官网
   * @param e
   */
  const onWebsite = async (e: any) => {
    e.preventDefault();
    try {
      await open("https://dowel.mortnon.tech");
    } catch (error) {
      console.error("open url fail:", error);
    }
  };

  /**
   * 点击跳转到反馈
   * @param e
   */
  const onFeedback = async (e: any) => {
    e.preventDefault();
    try {
      await open("https://github.com/mortise-and-tenon/Dowel/issues");
    } catch (error) {
      console.error("open url fail:", error);
    }
  };

  /**
   * 检查进行状态
   */
  const [checking, setChecking] = useState(false);

  /**
   * 检查是否完成
   */
  const [checked, setChecked] = useState(false);

  /**
   * 提示需要升级/不需要
   */
  const [needUpdate, setNeedUpdate] = useState(false);

  /**
   * 提示信息
   */
  const [updateTip, setUpdateTip] = useState("");

  /**
   * 检查版本更新
   */
  const onCheckUpdate = async () => {
    setChecking(true);
    setChecked(false);
    setNeedUpdate(false);
    setUpdateTip("");
    const url = "https://dowel.mortnon.tech/releases/version.json";
    const req: RequestOptions = {
      method: "GET",
      url: url,
    };

    try {
      const result = await fetchHttp(req);

      if (result.status == 200) {
        const data = JSON.parse(result.body);
        const version = data.version;
        newVersion = version;
        setNeedUpdate(hasNewVersion(APP_VERSION, version));
      } else {
        setUpdateTip("setting.update_retry");
      }
    } catch (error) {
      console.log("error");
      setUpdateTip("setting.update_retry");
    } finally {
      setChecking(false);
      setChecked(true);
    }
  };

  /**
   * 点击下载新版本
   * @param e
   */
  const onUpdate = async (e: any) => {
    const url = `https://github.com/mortise-and-tenon/Dowel/releases/download/${newVersion}/Dowel_${newVersion}_x64-setup.exe`;
    e.preventDefault();
    try {
      await open(url);
    } catch (error) {
      console.error("open url fail:", error);
    }
  };

  const hasNewVersion = (
    currentVersion: string,
    latestVersion: string
  ): boolean => {
    try {
      return compareVersion(latestVersion, currentVersion) === 1;
    } catch (error) {
      console.error("版本号比较失败:", error);
      return false;
    }
  };

  const compareVersion = (version1: string, version2: string): 1 | 0 | -1 => {
    // 空值容错
    if (!version1 && !version2) return 0;
    if (!version1) return -1;
    if (!version2) return 1;

    // 分割版本号为数字数组（处理多段，如 1.0.1.1 也兼容）
    const v1Segments = version1.split(".").map((segment) => {
      // 转换为数字（非数字段视为 0，如 1.0.x → 1.0.0）
      const num = parseInt(segment.trim(), 10);
      return isNaN(num) ? 0 : num;
    });
    const v2Segments = version2.split(".").map((segment) => {
      const num = parseInt(segment.trim(), 10);
      return isNaN(num) ? 0 : num;
    });

    // 补全长度（如 1.0 和 1.0.1 → 1.0.0 和 1.0.1）
    const maxLength = Math.max(v1Segments.length, v2Segments.length);
    while (v1Segments.length < maxLength) v1Segments.push(0);
    while (v2Segments.length < maxLength) v2Segments.push(0);

    // 逐段比较
    for (let i = 0; i < maxLength; i++) {
      const v1 = v1Segments[i];
      const v2 = v2Segments[i];
      if (v1 > v2) return 1;
      if (v1 < v2) return -1;
    }

    // 所有段相等
    return 0;
  };

  return (
    <div className="h-full p-8">
      <div className="card bg-base-100 w-full shadow-sm">
        <div className="card-body">
          <div className="flex justify-between">
            <h2 className="card-title">{t("setting.about")}</h2>
            <button className="btn btn-circle btn-ghost" onClick={onGitHub}>
              <ImGithub className="text-2xl" />
            </button>
          </div>
          <hr className="border-base-300" />
          <div className="flex justify-between items-center">
            <div className="flex">
              <div>
                <img src="/truss.png" width={100} height={100} alt="logo" />
              </div>
              <div className="flex flex-col space-y-2 pl-2">
                <h1 className="text-xl font-bold">{t("app_name")}</h1>
                <span>{t("app_desc")}</span>
                <div className="badge badge-primary">{APP_VERSION}</div>
              </div>
            </div>

            <div className="flex flex-col justify-center items-center space-y-2">
              <button className="btn" onClick={onCheckUpdate}>
                {checking && (
                  <span className="loading loading-spinner text-primary"></span>
                )}
                {t("setting.check_update")}
              </button>
              {updateTip != "" ? (
                <label className="label text-error">{t(updateTip)}</label>
              ) : (
                checked &&
                (needUpdate ? (
                  <label
                    className="label hover:text-primary hover:cursor-pointer"
                    onClick={onUpdate}
                  >
                    {t("setting.update_now")}
                  </label>
                ) : (
                  <label className="label">{t("setting.update_no")}</label>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <ul className="list bg-base-100 rounded-box shadow-sm mt-4">
        <li className="list-row items-center">
          <MdOutlineRssFeed className="text-xl" />
          <span className="">{t("setting.log")}</span>
          <button className="btn" onClick={onRelease}>
            {t("setting.details")}
          </button>
        </li>
        <li className="list-row items-center">
          <AiOutlineGlobal className="text-xl" />
          {t("setting.website")}
          <button className="btn" onClick={onWebsite}>
            {t("setting.view")}
          </button>
        </li>
        <li className="list-row items-center">
          <MdOutlineFeedback className="text-xl" />
          {t("setting.feedback")}
          <button className="btn" onClick={onFeedback}>
            {t("setting.feedback_action")}
          </button>
        </li>
      </ul>
    </div>
  );
}
