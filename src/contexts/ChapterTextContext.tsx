import { createContext, useContext } from "react";
import { LocationContext } from "./LocationContext.tsx";
import { useAsync } from "react-use";
import { fetch } from "@tauri-apps/plugin-http";
import { OnlyChildren } from "../utils.ts";
import { SelectedTranslationContext } from "./SelectedTranslationContext.tsx";

type ChapterTextContextType =
  | { loaded: false }
  | { loaded: true; text: string };

export const ChapterTextContext = createContext<ChapterTextContextType>({
  loaded: false,
});

export function ChapterTextProvider({ children }: OnlyChildren) {
  const { transCode, langCode } = useContext(SelectedTranslationContext);
  const {
    location: { bookCode, chapterNo },
  } = useContext(LocationContext);

  const { value, loading } = useAsync(async () => {
    const response = await fetch(
      `https://meebible.org/chapter?trans=${transCode}&lang=${langCode}&book=${bookCode}&chapter=${chapterNo}`,
    );
    return await response.text();
  }, [transCode, langCode, bookCode, chapterNo]);

  return (
    <ChapterTextContext.Provider
      value={
        value == null || loading
          ? { loaded: false }
          : { loaded: true, text: value }
      }
    >
      {children}
    </ChapterTextContext.Provider>
  );
}
