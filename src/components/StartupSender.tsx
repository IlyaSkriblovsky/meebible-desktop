import { type } from "@tauri-apps/plugin-os";
import { useAsync, useLocalStorage } from "react-use";

import { useSelectedTranslationContext } from "../contexts/SelectedTranslationContext.tsx";
import { universalFetch } from "../universalFetch.ts";
import { randomString } from "../utils.ts";

export function StartupSender() {
  const [installId] = useLocalStorage("installId", randomString(36));
  const { transCode, langCode } = useSelectedTranslationContext();

  useAsync(async () => {
    if (!import.meta.env.PROD) {
      return;
    }

    const osType = type();
    await universalFetch("https://meebible.org/startup", {
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
