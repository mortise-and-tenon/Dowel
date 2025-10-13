import { open } from "@tauri-apps/plugin-shell";
import { ReactNode } from "react";

/**
 * 外部链接组件
 * 用于调用浏览器打开链接
 * @param param0
 * @returns
 */
export default function ExternalLink({
  url,
  children,
}: {
  url: string;
  children: ReactNode;
}) {
  const onClick = async (e: any) => {
    e.preventDefault();
    try {
      await open(url);
    } catch (error) {
      console.error("open url fail:", error);
    }
  };
  return (
    <button className="btn btn-link" onClick={onClick}>
      {children}
    </button>
  );
}
