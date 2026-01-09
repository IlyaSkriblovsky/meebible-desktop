import { createContext, useContext, useEffect } from "react";
import { useAsync, useAsyncRetry } from "react-use";
import { SafeDictionary } from "ts-essentials";

import { BookInfo, BooksInfo, fetchBooksInfo } from "../api/books-info.ts";
import { AppRuntime, appRuntime, assertNever, OnlyChildren } from "../utils.ts";
import { ExecuteSQL, Select, SQLValue, useDatabaseContext } from "./DatabaseContext.tsx";
import { useSelectedTranslationContext } from "./SelectedTranslationContext.tsx";

type BooksListContextType =
  | { loaded: false }
  | ({
      loaded: true;
    } & BooksInfo);

const BooksListContext = createContext<BooksListContextType | null>(null);

export function useBooksListContext(): BooksListContextType {
  const context = useContext(BooksListContext);
  if (!context) {
    throw new Error("useBooksListContext must be used within a BooksListProvider");
  }
  return context;
}

interface BookInfoRow {
  bookNumber: number;
  bookCode: string;
  bookName: string;
  chaptersCount: number;
  versesInChapter: SafeDictionary<number, number>;
}

interface ChapterSizeRow {
  bookCode: string;
  chapterNo: number;
  versesCount: number;
}

async function loadCachedBooksInfo(select: Select, transCode: string, langCode: string): Promise<BooksInfo> {
  const infoRows = (await select(
    `
    SELECT bookNumber, bookCode, bookName, chaptersCount 
    FROM booksInfo 
    WHERE transCode = ? AND langCode = ? 
    ORDER BY bookNumber
  `,
    [transCode, langCode],
  )) as BookInfoRow[];

  const info: BooksInfo = {
    books: [],
    bookByCode: {},
    bookByNumber: {},
  };

  for (const row of infoRows) {
    const bookInfo: BookInfo = {
      bookNumber: row.bookNumber,
      code: row.bookCode,
      name: row.bookName,
      chaptersCount: row.chaptersCount,
      versesInChapter: {},
    };
    info.books.push(bookInfo);
    info.bookByCode[bookInfo.code] = bookInfo;
    info.bookByNumber[bookInfo.bookNumber] = bookInfo;
  }

  const chapterSizeRows = (await select(
    `
    SELECT bookCode, chapterNo, versesCount 
    FROM chapterSize
    WHERE transCode = ? AND langCode = ?
  `,
    [transCode, langCode],
  )) as ChapterSizeRow[];

  for (const row of chapterSizeRows) {
    const bookInfo = info.bookByCode[row.bookCode];
    if (bookInfo) {
      bookInfo.versesInChapter[row.chapterNo] = row.versesCount;
    }
  }

  return info;
}

async function saveBooksInfoToCache(
  executeSql: ExecuteSQL,
  transCode: string,
  langCode: string,
  booksInfo: BooksInfo,
): Promise<void> {
  const sql: string[] = [];
  const params: SQLValue[] = [];

  sql.push("DELETE FROM booksInfo WHERE transCode = ? AND langCode = ?");
  params.push(transCode, langCode);
  sql.push("DELETE FROM chapterSize WHERE transCode = ? AND langCode = ?");
  params.push(transCode, langCode);

  for (const book of booksInfo.books) {
    sql.push(
      `INSERT INTO booksInfo (transCode, langCode, bookNumber, bookCode, bookName, chaptersCount) VALUES (?, ?, ?, ?, ?, ?)`,
    );
    params.push(transCode, langCode, book.bookNumber, book.code, book.name, book.chaptersCount);

    for (const [chapterNoStr, versesCount] of Object.entries(book.versesInChapter)) {
      const chapterNo = parseInt(chapterNoStr, 10);
      sql.push(
        `INSERT INTO chapterSize (transCode, langCode, bookCode, chapterNo, versesCount) VALUES (?, ?, ?, ?, ?)`,
      );
      params.push(transCode, langCode, book.code, chapterNo, versesCount);
    }
  }

  await executeSql(sql.join("; "), params);
}

function CachedBooksListProvider({ children }: OnlyChildren) {
  const { select, executeSql } = useDatabaseContext();

  const { transCode, langCode } = useSelectedTranslationContext();

  const { value, error } = useAsyncRetry(async () => {
    const cached = await loadCachedBooksInfo(select, transCode, langCode);
    if (cached.books.length > 0) {
      return cached;
    }

    const fetched = await fetchBooksInfo(transCode, langCode);
    await saveBooksInfoToCache(executeSql, transCode, langCode, fetched);
    return fetched;
  }, [select, executeSql, transCode, langCode]);

  useEffect(console.error, [error]);

  return (
    <BooksListContext.Provider value={value ? { loaded: true, ...value } : { loaded: false }}>
      {children}
    </BooksListContext.Provider>
  );
}

function NonCachedBooksListProvider({ children }: OnlyChildren) {
  const { transCode, langCode } = useSelectedTranslationContext();

  const { value } = useAsync(() => fetchBooksInfo(transCode, langCode), [transCode, langCode]);

  return (
    <BooksListContext.Provider value={value ? { loaded: true, ...value } : { loaded: false }}>
      {children}
    </BooksListContext.Provider>
  );
}

export function BooksListProvider({ children }: OnlyChildren) {
  switch (appRuntime) {
    case AppRuntime.TAURI:
      return <CachedBooksListProvider>{children}</CachedBooksListProvider>;
    case AppRuntime.WEB:
      return <NonCachedBooksListProvider>{children}</NonCachedBooksListProvider>;
    default:
      assertNever(appRuntime);
  }
}
