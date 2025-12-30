import { createContext, useContext } from "react";
import { useAsync } from "react-use";

import { universalFetch } from "../universalFetch.ts";
import { OnlyChildren } from "../utils.ts";
import { useLocationContext } from "./LocationContext.tsx";
import { useSelectedTranslationContext } from "./SelectedTranslationContext.tsx";

type ChapterTextContextType = { loaded: false } | { loaded: true; text: string };

const ChapterTextContext = createContext<ChapterTextContextType | null>(null);

export function useChapterTextContext(): ChapterTextContextType {
  const context = useContext(ChapterTextContext);
  if (!context) {
    throw new Error("useChapterTextContext must be used within a ChapterTextProvider");
  }
  return context;
}

export function ChapterTextProvider({ children }: OnlyChildren) {
  const { transCode, langCode } = useSelectedTranslationContext();
  const {
    location: { bookCode, chapterNo },
  } = useLocationContext();

  const { value, loading } = useAsync(async () => {
    const response = await universalFetch(
      `https://meebible.org/chapter?trans=${transCode}&lang=${langCode}&book=${bookCode}&chapter=${chapterNo}`,
    );
    return await response.text();
  }, [transCode, langCode, bookCode, chapterNo]);

  return (
    <ChapterTextContext.Provider value={value == null || loading ? { loaded: false } : { loaded: true, text: value }}>
      {children}
    </ChapterTextContext.Provider>
  );
}
