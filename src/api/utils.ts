import { ClientOptions } from "@tauri-apps/plugin-http";

import { AppRuntime, appRuntime, assertNever } from "../utils.ts";

export async function universalFetch(
  url: URL | Request | string,
  init?: RequestInit & ClientOptions,
): Promise<Response> {
  const options: RequestInit & ClientOptions = {
    ...(init ?? {}),
    mode: "cors",
  };

  switch (appRuntime) {
    case AppRuntime.TAURI: {
      return (await import("@tauri-apps/plugin-http")).fetch(url, options);
    }

    case AppRuntime.WEB: {
      return window.fetch(url, options);
    }

    default:
      assertNever(appRuntime);
  }
}

export async function fetchAndParseXML(url: string): Promise<Document> {
  const normalizedUrl = `https://meebible.org/${url.replace(/^\//, "")}`;
  const response = await universalFetch(normalizedUrl);
  return new window.DOMParser().parseFromString(await response.text(), "text/xml");
}
