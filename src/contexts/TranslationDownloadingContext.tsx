import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { noop } from "ts-essentials";

import { BookInfo } from "../api/books-info.ts";
import { OnlyChildren } from "../utils.ts";
import { useBooksListContext } from "./BooksContext.tsx";
import { useChapterCacheContext, useTotalCachedChapters } from "./ChapterCacheContext.tsx";
import { useSelectedTranslationContext } from "./SelectedTranslationContext.tsx";

interface TranslationDownloadingContextType {
  isSupported: boolean;
  isDownloaded: boolean;
  isDownloading: boolean;
  isDownloadingDone: boolean;
  isCanceled: boolean;
  progress: number; // 0 to 1
  start(): void;
  cancel(): void;
  clearDone(): void;
}

const dummyDownloadState: TranslationDownloadingContextType = {
  isSupported: false,
  isDownloaded: false,
  isDownloading: false,
  isDownloadingDone: false,
  isCanceled: false,
  progress: 0,
  start: noop,
  cancel: noop,
  clearDone: noop,
};
const TranslationDownloadingContext = React.createContext<TranslationDownloadingContextType>(dummyDownloadState);

export function useTranslationDownloadingContext(): TranslationDownloadingContextType {
  return React.useContext(TranslationDownloadingContext);
}

export function TranslationDownloadingContextProvider({ children }: OnlyChildren) {
  const cacheContext = useChapterCacheContext();

  const { transCode, langCode } = useSelectedTranslationContext();
  const booksInfo = useBooksListContext();
  const cachedChapters = useTotalCachedChapters();

  const [downloading, setDownloading] = useState(false);
  const canceledRef = useRef(false);
  const [canceled, setCanceled] = useState(false);
  const [downloadingDone, setDownloadingDone] = useState(false);

  const start = useCallback(async () => {
    if (!booksInfo.loaded) {
      return;
    }

    setDownloading(true);
    setCanceled(false);
    canceledRef.current = false;
    setDownloadingDone(false);

    function* generatePromises(books: BookInfo[]) {
      for (const book of books) {
        for (let chapterNo = 1; chapterNo <= book.chaptersCount; chapterNo++) {
          yield cacheContext.fetchChapterText(transCode, langCode, book.code, chapterNo);
        }
      }
    }

    const generator = generatePromises(booksInfo.books);

    const parallelism = 10; // Number of concurrent downloads

    try {
      const inflight: Promise<string>[] = [];
      while (true) {
        if (canceledRef.current) {
          return;
        }

        while (inflight.length < parallelism) {
          const next = generator.next();
          if (next.done) {
            break;
          }
          const promise = next.value.then((result) => {
            const index = inflight.indexOf(promise);
            if (index >= 0) {
              inflight.splice(index, 1);
            }
            return result;
          });
          inflight.push(promise);
        }

        if (inflight.length === 0) {
          break;
        }

        await Promise.race(inflight);
      }

      setDownloadingDone(true);
    } finally {
      setDownloading(false);
    }
  }, [transCode, langCode, booksInfo]);

  const cancel = useCallback(() => {
    canceledRef.current = true;
    setCanceled(true);
    setDownloading(false);
    setDownloadingDone(false);
  }, []);

  const clearDone = useCallback(() => {
    setDownloadingDone(false);
  }, []);

  useEffect(() => {
    cancel();
  }, [cancel, transCode, langCode]);

  const totalChapters = useMemo(() => {
    if (!booksInfo.loaded) {
      return null;
    }
    return booksInfo.books.reduce((acc, book) => acc + book.chaptersCount, 0);
  }, [booksInfo]);

  const value = useMemo((): TranslationDownloadingContextType => {
    if (!cacheContext.cacheSupported) {
      return dummyDownloadState;
    }
    if (totalChapters == null || cachedChapters == null) {
      return dummyDownloadState;
    }
    const isDownloaded = cachedChapters >= totalChapters;

    return {
      isSupported: true,
      isDownloaded,
      isDownloading: downloading,
      isDownloadingDone: downloadingDone,
      isCanceled: canceled,
      progress: cachedChapters / totalChapters,
      start: isDownloaded ? noop : start,
      cancel,
      clearDone,
    };
  }, [
    cacheContext.cacheSupported,
    downloading,
    canceled,
    downloadingDone,
    cachedChapters,
    totalChapters,
    start,
    cancel,
    clearDone,
  ]);

  return <TranslationDownloadingContext.Provider value={value}>{children}</TranslationDownloadingContext.Provider>;
}
