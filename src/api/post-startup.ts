import { universalFetch } from "./utils.ts";

export async function postStartup(os: string, installId: string, transCode: string, langCode: string): Promise<void> {
  await universalFetch("https://meebible.org/startup", {
    method: "POST",
    body: new URLSearchParams({
      os,
      device_id: installId,
      trans: transCode,
      lang: langCode,
    }),
  });
}
