import React, { useMemo } from "react";
import { useAsyncRetry, useLocalStorage } from "react-use";

import { AppRuntime, appRuntime, assertNever } from "../utils.ts";
import { useDatabaseContext } from "./DatabaseContext.tsx";
import { useLocationContext } from "./LocationContext.tsx";

export interface BookmarksContextType {
  loaded: boolean;
  bookmarkedVerses: number[];

  addVersesToBookmarks(verseNo: number[]): Promise<void>;
  removeVersesFromBookmarks(verseNo: number[]): Promise<void>;
}

const BookmarksContext = React.createContext<BookmarksContextType | null>(null);

export function useBookmarksContext(): BookmarksContextType {
  const context = React.useContext(BookmarksContext);
  if (!context) {
    throw new Error("useBookmarksContext must be used within a BookmarksProvider");
  }
  return context;
}

const SELECT_BOOKMARKED_VERSES = "SELECT verseNo FROM bookmarks WHERE bookCode = ? AND chapterNo = ? ORDER BY verseNo";
const INSERT_BOOKMARK = "INSERT INTO bookmarks (bookCode, chapterNo, verseNo) VALUES (?, ?, ?)";
const DELETE_BOOKMARK = "DELETE FROM bookmarks WHERE bookCode = ? AND chapterNo = ? AND verseNo = ?";

function TauriBookmarksProvider({ children }: React.PropsWithChildren) {
  const { select, executeSql } = useDatabaseContext();
  const { location } = useLocationContext();

  const { value: bookmarkedVerses, retry: reloadBookmarks } = useAsyncRetry(async () => {
    const rows = (await select(SELECT_BOOKMARKED_VERSES, [location.bookCode, location.chapterNo])) as {
      verseNo: number;
    }[];
    return rows.map((row) => row.verseNo);
  }, [location]);

  const value = useMemo(
    (): BookmarksContextType => ({
      loaded: bookmarkedVerses !== undefined,
      bookmarkedVerses: bookmarkedVerses ?? [],
      addVersesToBookmarks: async (verseNos: number[]) => {
        for (const verseNo of verseNos) {
          await executeSql(INSERT_BOOKMARK, [location.bookCode, location.chapterNo, verseNo]);
        }
        reloadBookmarks();
      },
      removeVersesFromBookmarks: async (verseNos: number[]) => {
        for (const verseNo of verseNos) {
          await executeSql(DELETE_BOOKMARK, [location.bookCode, location.chapterNo, verseNo]);
        }
        reloadBookmarks();
      },
    }),
    [bookmarkedVerses, location],
  );

  return <BookmarksContext.Provider value={value}>{children}</BookmarksContext.Provider>;
}

type BookmarksByChapter = Record<string, number[] | undefined>;

function uniqAndSort(items: Iterable<number>): number[] {
  return Array.from(new Set(items)).sort((a, b) => a - b);
}

function WebBookmarksProvider({ children }: React.PropsWithChildren) {
  const { location } = useLocationContext();
  const [bookmarks, setBookmarks] = useLocalStorage<BookmarksByChapter>("bookmarks", {});

  const storageKey = `${location.bookCode}:${location.chapterNo}`;
  const bookmarkedVerses = bookmarks?.[storageKey] ?? [];

  const value = useMemo(
    (): BookmarksContextType => ({
      loaded: bookmarks !== undefined,
      bookmarkedVerses,
      addVersesToBookmarks: async (verseNos: number[]) => {
        setBookmarks({
          ...bookmarks,
          [storageKey]: uniqAndSort([...(bookmarks?.[storageKey] ?? []), ...verseNos]),
        });
      },
      removeVersesFromBookmarks: async (verseNos: number[]) => {
        const remaining = new Set(bookmarks?.[storageKey] ?? []);
        verseNos.forEach((verseNo) => remaining.delete(verseNo));
        const sorted = uniqAndSort(remaining);

        setBookmarks({
          ...bookmarks,
          [storageKey]: sorted.length > 0 ? sorted : undefined,
        });
      },
    }),
    [bookmarkedVerses, bookmarks, setBookmarks, storageKey],
  );

  return <BookmarksContext.Provider value={value}>{children}</BookmarksContext.Provider>;
}

export function BookmarksProvider({ children }: React.PropsWithChildren) {
  switch (appRuntime) {
    case AppRuntime.TAURI:
      return <TauriBookmarksProvider>{children}</TauriBookmarksProvider>;
    case AppRuntime.WEB:
      return <WebBookmarksProvider>{children}</WebBookmarksProvider>;
    default:
      assertNever(appRuntime);
  }
}
