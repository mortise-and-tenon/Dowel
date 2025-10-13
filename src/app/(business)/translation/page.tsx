"use client";
import { AliTranslation } from "@/app/utils/translations/aliTranslation";
import { BaiduTranslation } from "@/app/utils/translations/baiduTranslation";
import { useState } from "react";

export default function Translation() {
  /**
   * 待翻译的原文
   */
  const [originalText, setOriginalText] = useState("");
  const [transltedText, setTransltedText] = useState("");
  const aliTranslation = new AliTranslation();
  const baiduTranslation = new BaiduTranslation();
  const onTranslate = async () => {
    try {
      // const result = await aliTranslation.translateWithKey(
      //   originalText,
      //   "auto", // 自动检测源语言
      //   "en", // 目标语言为中文
      //   "https://mt.cn-hangzhou.aliyuncs.com",
      //   "LTAI5tKkuh382GowkfSMEibF",
      //   "LZaKMI7SgHsDKm51L2LDCio5S1PgFO"
      // );

      const result = await baiduTranslation.translateWithKey(
        originalText,
        "auto",
        "en",
        "https://fanyi-api.baidu.com/api/trans/vip/translate",
        "20251011002472712",
        "hVRArz57EM0Ui0W_rHSU"
      );

      setTransltedText(result.translated);
    } catch (error: any) {
      console.error("翻译失败:", error.message);
    }
  };

  const onChangeOriginal = (e: any) => {
    setOriginalText(e.target.value);
  };

  return (
    <div>
      <fieldset className="fieldset">
        <legend className="fieldset-legend">原文</legend>
        <textarea
          className="textarea h-24"
          placeholder="原文"
          value={originalText}
          onChange={onChangeOriginal}
        ></textarea>
      </fieldset>
      <button className="btn" onClick={onTranslate}>
        翻译
      </button>
      <fieldset className="fieldset">
        <legend className="fieldset-legend">译文</legend>
        <textarea
          className="textarea h-24"
          placeholder="译文"
          defaultValue={transltedText}
        ></textarea>
        <div className="label">阿里云</div>
      </fieldset>
    </div>
  );
}
