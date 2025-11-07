"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

/**
 * 热键输入组件
 * @param param0
 * @returns
 */
export default function HotKeyInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();

  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      const keys = [];
      if (e.ctrlKey) keys.push("Ctrl");
      if (e.metaKey) keys.push("Cmd");
      if (e.altKey) keys.push("Alt");
      if (e.shiftKey) keys.push("Shift");
      if (!["Control", "Meta", "Alt", "Shift"].includes(e.key)) {
        keys.push(e.key === " " ? "Space" : e.key.toUpperCase());
      }

      if (keys.length > 0) {
        onChange(keys.join("+"));
      }
    };
    if (isActive) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isActive]);

  const onFocus = () => {
    setIsActive(true);
  };

  const onBlur = () => {
    setIsActive(false);
  };

  return (
    <div
      tabIndex={0}
      onFocus={onFocus}
      onBlur={onBlur}
      className="input focus:outline-none"
    >
      {value != "" ? (
        value.split("+").map((key, i) => (
          <>
            {i > 0 && <span key={`plus${i}`}> + </span>}
            <kbd key={`kbd${i}`} className="kbd kbd-sm">
              {key}
            </kbd>
          </>
        ))
      ) : isActive ? (
        <span className="text-gray-500">{t("translation.press_btn")}</span>
      ) : (
        <span className="text-gray-500">点击设置</span>
      )}
    </div>
  );
}
