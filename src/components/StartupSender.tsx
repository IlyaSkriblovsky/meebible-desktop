import { fetch } from "@tauri-apps/plugin-http";
import { type } from "@tauri-apps/plugin-os";
import { useAsync, useLocalStorage } from "react-use";

import { useSelectedTranslationContext } from "../contexts/SelectedTranslationContext.tsx";

export function StartupSender() {
  const [installId] = useLocalStorage("installId", crypto.randomUUID());
  const { transCode, langCode } = useSelectedTranslationContext();

  useAsync(async () => {
    if (!import.meta.env.PROD) {
      return;
    }

    const osType = type();
    await fetch("https://meebible.org/startup", {
      method: "POST",
      body: new URLSearchParams({
        os: osType,
        device_id: installId ?? "_",
        trans: transCode,
        lang: langCode,
      }),
    });
  }, []);

  return null;
}
