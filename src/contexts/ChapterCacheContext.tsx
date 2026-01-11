import React, { useCallback, useMemo } from "react";
import { useAsync, useCounter } from "react-use";

import { fetchChapterText } from "../api/chapter-text.ts";
import { AppRuntime, appRuntime, assertNever, OnlyChildren, usePrintError } from "../utils.ts";
import { ExecuteSQL, Select, useDatabaseContext } from "./DatabaseContext.tsx";
import { useLocationContext } from "./LocationContext.tsx";
import { useSelectedTranslationContext } from "./SelectedTranslationContext.tsx";

interface BaseCacheContextType {
  fetchChapterText(transCode: string, langCode: string, bookCode: string, chapterNo: number): Promise<string>;
}

interface CacheSupportedContextType extends BaseCacheContextType {
  cacheSupported: true;
  cacheChangeCounter: number;
  getTotalChaptersInCache(transCode: string, langCode: string): Promise<number>;
}

interface CacheNotSupportedContextType extends BaseCacheContextType {
  cacheSupported: false;
}

type ChapterCacheContextType = CacheSupportedContextType | CacheNotSupportedContextType;

const ChapterCacheContext = React.createContext<ChapterCacheContextType | null>(null);

export function useChapterCacheContext(): ChapterCacheContextType {
  const context = React.useContext(ChapterCacheContext);
  if (!context) {
    throw new Error("useChapterCacheContext must be used within a ChapterCacheProvider");
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

async function loadTotalCachedChapters(select: Select, transCode: string, langCode: string): Promise<number> {
  const rows = (await select(
    `
    SELECT COUNT(*) AS count
    FROM htmlCache
    WHERE transCode = ? AND langCode = ?
  `,
    [transCode, langCode],
  )) as { count: number }[];

  return rows[0]?.count ?? 0;
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

function DBCacheContextProvider({ children }: OnlyChildren) {
  const { select, executeSql } = useDatabaseContext();

  const [changeCounter, { inc: incChangeCounter }] = useCounter(0);

  const getCachedOrFetch = useCallback(
    async (transCode: string, langCode: string, bookCode: string, chapterNo: number): Promise<string> => {
      const cached = await loadCachedChapterText(select, transCode, langCode, bookCode, chapterNo);
      if (cached != null) {
        return cached;
      }

      const fetched = await fetchChapterText(transCode, langCode, bookCode, chapterNo);
      await saveChapterTextToCache(executeSql, transCode, langCode, bookCode, chapterNo, fetched);
      incChangeCounter();
      return fetched;
    },
    [select, executeSql],
  );

  const getTotalChaptersInCache = useCallback(
    async (transCode: string, langCode: string): Promise<number> => {
      return loadTotalCachedChapters(select, transCode, langCode);
    },
    [select],
  );

  const value = useMemo((): CacheSupportedContextType => {
    return {
      cacheSupported: true,
      cacheChangeCounter: changeCounter,
      fetchChapterText: getCachedOrFetch,
      getTotalChaptersInCache,
    };
  }, [select, executeSql, getCachedOrFetch, getTotalChaptersInCache, changeCounter]);

  return <ChapterCacheContext.Provider value={value}>{children}</ChapterCacheContext.Provider>;
}

function NoCacheContextProvider({ children }: OnlyChildren) {
  const value = useMemo(
    (): CacheNotSupportedContextType => ({
      cacheSupported: false,
      fetchChapterText: fetchChapterText,
    }),
    [],
  );

  return <ChapterCacheContext.Provider value={value}>{children}</ChapterCacheContext.Provider>;
}

export function CacheContextProvider({ children }: OnlyChildren) {
  switch (appRuntime) {
    case AppRuntime.TAURI:
      return <DBCacheContextProvider>{children}</DBCacheContextProvider>;
    case AppRuntime.WEB:
      return <NoCacheContextProvider>{children}</NoCacheContextProvider>;
    default:
      assertNever(appRuntime);
  }
}

type UseCurrentChapterText = { loaded: false } | { loaded: true; text: string };

export function useCurrentChapterTextContext(): UseCurrentChapterText {
  const { fetchChapterText } = useChapterCacheContext();
  const { transCode, langCode } = useSelectedTranslationContext();
  const {
    location: { bookCode, chapterNo },
  } = useLocationContext();

  const {
    value: html,
    loading,
    error,
  } = useAsync(
    () => fetchChapterText(transCode, langCode, bookCode, chapterNo),
    [transCode, langCode, bookCode, chapterNo],
  );
  usePrintError(error);

  return useMemo((): UseCurrentChapterText => {
    if (html == null || loading) {
      return { loaded: false };
    } else {
      return { loaded: true, text: html };
    }
  }, [html, loading]);
}

export function useTotalCachedChapters(): number | undefined {
  const cacheContext = useChapterCacheContext();
  const { transCode, langCode } = useSelectedTranslationContext();

  const { value } = useAsync(async () => {
    if (!cacheContext.cacheSupported) {
      return undefined;
    }
    return cacheContext.getTotalChaptersInCache(transCode, langCode);
  }, [
    cacheContext.cacheSupported && cacheContext.getTotalChaptersInCache,
    cacheContext.cacheSupported && cacheContext.cacheChangeCounter,
    transCode,
    langCode,
  ]);

  return value;
}
