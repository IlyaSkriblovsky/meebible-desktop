import { type } from "@tauri-apps/plugin-os";
import { useAsync, useLocalStorage } from "react-use";

import { postStartup } from "../api/post-startup.ts";
import { useSelectedTranslationContext } from "../contexts/SelectedTranslationContext.tsx";
import { AppRuntime, appRuntime, assertNever, randomString } from "../utils.ts";

export function StartupSender() {
  const [installId] = useLocalStorage("installId", randomString(36));
  const { transCode, langCode } = useSelectedTranslationContext();

  useAsync(async () => {
    if (!import.meta.env.PROD) {
      return;
    }

    let os: string;
    switch (appRuntime) {
      case AppRuntime.WEB:
        os = "web";
        break;
      case AppRuntime.TAURI:
        os = type();
        break;
      default:
        assertNever(appRuntime);
    }

    await postStartup(os, installId ?? "_", transCode, langCode);
  }, []);

  return null;
}
