import { createContext, useContext, useEffect } from "react";
import { useAsync, useAsyncRetry } from "react-use";

import { fetchChapterText } from "../api/chapter-text.ts";
import { AppRuntime, appRuntime, assertNever, OnlyChildren } from "../utils.ts";
import { ExecuteSQL, Select, useDatabaseContext } from "./DatabaseContext.tsx";
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

interface HtmlCacheRow {
  html: string;
}

async function loadCachedChapterText(
  select: Select,
  transCode: string,
  langCode: string,
  bookCode: string,
  chapterNo: number,
): Promise<string | null> {
  const rows = (await select(
    `
    SELECT html
    FROM htmlCache
    WHERE transCode = ? AND langCode = ? AND bookCode = ? AND chapterNo = ?
  `,
    [transCode, langCode, bookCode, chapterNo],
  )) as HtmlCacheRow[];

  if (rows.length === 0) {
    return null;
  }

  return rows[0].html;
}

async function saveChapterTextToCache(
  executeSql: ExecuteSQL,
  transCode: string,
  langCode: string,
  bookCode: string,
  chapterNo: number,
  html: string,
): Promise<void> {
  await executeSql(
    `
    INSERT INTO htmlCache (transCode, langCode, bookCode, chapterNo, html)
    VALUES (?, ?, ?, ?, ?)
  `,
    [transCode, langCode, bookCode, chapterNo, html],
  );
}

function CachedChapterTextProvider({ children }: OnlyChildren) {
  const { select, executeSql } = useDatabaseContext();
  const { transCode, langCode } = useSelectedTranslationContext();
  const {
    location: { bookCode, chapterNo },
  } = useLocationContext();

  const { value, error, loading } = useAsyncRetry(async () => {
    const cached = await loadCachedChapterText(select, transCode, langCode, bookCode, chapterNo);
    if (cached != null) {
      return cached;
    }

    const fetched = await fetchChapterText(transCode, langCode, bookCode, chapterNo);
    await saveChapterTextToCache(executeSql, transCode, langCode, bookCode, chapterNo, fetched);
    return fetched;
  }, [select, executeSql, transCode, langCode, bookCode, chapterNo]);

  useEffect(console.error, [error]);

  return (
    <ChapterTextContext.Provider value={value == null || loading ? { loaded: false } : { loaded: true, text: value }}>
      {children}
    </ChapterTextContext.Provider>
  );
}

function NonCachedChapterTextProvider({ children }: OnlyChildren) {
  const { transCode, langCode } = useSelectedTranslationContext();
  const {
    location: { bookCode, chapterNo },
  } = useLocationContext();

  const { value, loading } = useAsync(
    async () => fetchChapterText(transCode, langCode, bookCode, chapterNo),
    [transCode, langCode, bookCode, chapterNo],
  );

  return (
    <ChapterTextContext.Provider value={value == null || loading ? { loaded: false } : { loaded: true, text: value }}>
      {children}
    </ChapterTextContext.Provider>
  );
}

export function ChapterTextProvider({ children }: OnlyChildren) {
  switch (appRuntime) {
    case AppRuntime.TAURI:
      return <CachedChapterTextProvider>{children}</CachedChapterTextProvider>;
    case AppRuntime.WEB:
      return <NonCachedChapterTextProvider>{children}</NonCachedChapterTextProvider>;
    default:
      assertNever(appRuntime);
  }
}
