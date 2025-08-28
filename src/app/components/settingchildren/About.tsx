"use client";
import { I18nContext } from "@/app/utils/providers/I18nProvider";
import Image from "next/image";
import { useContext } from "react";
import { ImGithub } from "react-icons/im";

/**
 * 关于我们界面
 * @returns
 */
export default function About() {
  const { i18n } = useContext(I18nContext);

  return (
    <div className="h-full p-8 ">
      <div className="card bg-base-100 w-full shadow-sm">
        <div className="card-body">
          <div className="flex justify-between">
            <h2 className="card-title">关于我们</h2>
            <button className="btn btn-circle btn-ghost">
              <ImGithub className="text-2xl" />
            </button>
          </div>
          <hr className="border-base-300" />
          <div className="flex justify-between items-center">
            <div className="flex">
              <div>
                <Image src="/truss.png" width={100} height={100} alt="logo" />
              </div>
              <div className="flex flex-col space-y-2 pl-2">
                <h1 className="text-xl font-bold">{i18n("app_name")}</h1>
                <span>{i18n("app_desc")}</span>
                <div className="badge badge-primary">版本1.0.0</div>
              </div>
            </div>

            <button className="btn">检查更新</button>
          </div>
        </div>
      </div>
    </div>
  );
}
