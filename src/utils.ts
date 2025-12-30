import { ReactNode } from "react";
import { useAsync } from "react-use";

import { universalFetch } from "./universalFetch.ts";

export interface OnlyChildren {
  children: ReactNode;
}

function isTauriRuntime(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  if (typeof __APP_RUNTIME__ !== "undefined") {
    return __APP_RUNTIME__ === "tauri";
  }

  return "__TAURI__" in window || "__TAURI_INTERNALS__" in window;
}

// export type AppRuntime = "tauri" | "web";
export enum AppRuntime {
  TAURI = "tauri",
  WEB = "web",
}
export const appRuntime: AppRuntime = isTauriRuntime() ? AppRuntime.TAURI : AppRuntime.WEB;

export function useAppVersion(): string | undefined {
  const { value } = useAsync(async () => {
    if (!isTauriRuntime()) {
      return undefined;
    }

    const { getVersion } = await import("@tauri-apps/api/app");
    return getVersion();
  });
  return value;
}

export async function fetchAndParseXML(url: string): Promise<Document> {
  const normalizedUrl = `https://meebible.org/${url.replace(/^\//, "")}`;
  const response = await universalFetch(normalizedUrl);
  return new window.DOMParser().parseFromString(await response.text(), "text/xml");
}

export function useDisableContextMenu() {
  if (import.meta.env.PROD) {
    document.oncontextmenu = (event) => event.preventDefault();
  }
}

export function lowerCaseRemoveDiacritics(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function assertNever(value: never): never {
  throw new Error("Unexpected value: " + value);
}
