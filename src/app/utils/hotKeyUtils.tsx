import {
  register,
  unregister,
  unregisterAll,
} from "@tauri-apps/plugin-global-shortcut";
import { TauriAdapter } from "./utils";
import { readText, writeText } from "@tauri-apps/plugin-clipboard-manager";
import { showNotification } from "./notifyUtils";
import i18n from "../lib/i18n";
import { AiUtils } from "./aiUtils";
import {
  translationInstances,
  User_Msg_Format,
} from "./translations/translationInferace";

export async function registerHotkey(hotkey: string, event: () => void) {
  try {
    // 注册热键，绑定触发回调
    await register(hotkey, async () => {
      console.log("热键触发:", hotkey);
      // 触发后执行：读剪贴板 → 翻译 → 写剪贴板 → 托盘提示
      await event();
    });
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

// 应用退出时注销热键（避免残留）
export async function unregisterHotkey(hotkey: string) {
  try {
    await unregister(hotkey);
  } catch (error) {}
}

const adapter = new TauriAdapter();

export async function onHotKeyTranslation() {
  //读取剪贴板内容用于翻译
  const originalText = await readText();

  showNotification(i18n.t("translation.clipboard.start"));

  const aiUtils = new AiUtils();
  const aiData = await adapter.readAiData("translation");
  const translationConfig = await adapter.readTranslationConfig();
  const locale =
    translationConfig.locale && translationConfig.locale != ""
      ? translationConfig.locale
      : "zh";
  //如果配置了ai翻译，使用ai翻译
  if (aiData && aiData.on) {
    try {
      const msg = User_Msg_Format.replace("$target_txt", locale).replace(
        "$original_txt",
        originalText
      );
      const result = await aiUtils
        .singleCompletions(aiData.name, msg)
        .then((result) => {
          if (result.success) {
            return result.data;
          }
        });
      await writeText(result);
      showNotification(i18n.t("translation.clipboard.end"));
      return;
    } catch (error) {
      console.error("ai translate error:", error);
      await showNotification(i18n.t("translation.clipboard.error"));
      return;
    }
  }

  const translationData = await adapter.readTranslations();

  const resultData = translationData.find((item) => item.on);
  if (resultData) {
    try {
      const result = await translationInstances[resultData.name]
        .translate(originalText, "auto", locale)
        .then((result) => result.translated);
      await writeText(result);
      showNotification(i18n.t("translation.clipboard.end"));
    } catch (error) {
      console.error("common translate error:", error);
      await showNotification(i18n.t("translation.clipboard.error"));
    }
  }
}
