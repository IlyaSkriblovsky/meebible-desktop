import React, { useMemo } from "react";
import { useAsyncRetry } from "react-use";

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

export function BookmarksProvider({ children }: React.PropsWithChildren) {
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
