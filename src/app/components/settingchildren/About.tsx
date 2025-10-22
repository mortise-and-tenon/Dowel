"use client";
import { APP_VERSION } from "@/app/utils/constants";
import { I18nContext } from "@/app/utils/providers/I18nProvider";
import { open } from "@tauri-apps/plugin-shell";
import Image from "next/image";
import { useContext } from "react";
import { AiOutlineGlobal } from "react-icons/ai";
import { ImGithub } from "react-icons/im";
import { MdOutlineFeedback, MdOutlineRssFeed } from "react-icons/md";

/**
 * 关于我们页面
 * @returns
 */
export default function About() {
  const { i18n } = useContext(I18nContext);

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
      await open("https://dowel.mortnon.tech/releases");
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

  return (
    <div className="h-full p-8">
      <div className="card bg-base-100 w-full shadow-sm">
        <div className="card-body">
          <div className="flex justify-between">
            <h2 className="card-title">{i18n("setting.about")}</h2>
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
                <h1 className="text-xl font-bold">{i18n("app_name")}</h1>
                <span>{i18n("app_desc")}</span>
                <div className="badge badge-primary">{APP_VERSION}</div>
              </div>
            </div>

            <button className="btn">{i18n("setting.check_update")}</button>
          </div>
        </div>
      </div>
      <ul className="list bg-base-100 rounded-box shadow-sm mt-4">
        <li className="list-row items-center">
          <MdOutlineRssFeed className="text-xl" />
          <span className="">{i18n("setting.log")}</span>
          <button className="btn" onClick={onRelease}>
            {i18n("setting.details")}
          </button>
        </li>
        <li className="list-row items-center">
          <AiOutlineGlobal className="text-xl" />
          {i18n("setting.website")}
          <button className="btn" onClick={onWebsite}>
            {i18n("setting.view")}
          </button>
        </li>
        <li className="list-row items-center">
          <MdOutlineFeedback className="text-xl" />
          {i18n("setting.feedback")}
          <button className="btn" onClick={onFeedback}>
            {i18n("setting.feedback_action")}
          </button>
        </li>
      </ul>
    </div>
  );
}
