import { useAsync } from "react-use";
import { getVersion } from "@tauri-apps/api/app";
import { fetch } from "@tauri-apps/plugin-http";
import { ReactNode } from "react";

export interface OnlyChildren {
  children: ReactNode;
}

export function useAppVersion(): string | undefined {
  const { value } = useAsync(getVersion);
  return value;
}

export async function fetchAndParseXML(url: string): Promise<Document> {
  const response = await fetch(
    `https://meebible.org/${url.replace(/^\//, "")}`,
  );
  return new window.DOMParser().parseFromString(
    await response.text(),
    "text/xml",
  );
}
