import { createContext, useContext } from "react";
import { useAsync } from "react-use";

import { fetchAndParseXML, OnlyChildren } from "../utils.ts";
import { SelectedTranslationContext } from "./SelectedTranslationContext.tsx";

interface BookInfo {
  bookNumber: number;
  code: string;
  name: string;
  chaptersCount: number;
  versesInChapter: Record<number, number>;
}

interface BooksInfo {
  books: BookInfo[];
  bookByCode: Record<string, BookInfo | undefined>;
  bookByNumber: Record<number, BookInfo | undefined>;
}

type BooksListContextType =
  | { loaded: false }
  | ({
      loaded: true;
    } & BooksInfo);

export const BooksListContext = createContext<BooksListContextType>({
  loaded: false,
});

function parseBooksInfo(xml: Document): BooksInfo {
  const books: BookInfo[] = [];
  const bookByCode: Record<string, BookInfo | undefined> = {};
  const bookByNumber: Record<number, BookInfo | undefined> = {};

  Array.from(xml.querySelectorAll("book")).forEach((bookElem, bookIndex) => {
    const chapterElems = Array.from(bookElem.querySelectorAll("chapter"));
    const bookInfo: BookInfo = {
      bookNumber: bookIndex + 1,
      code: bookElem.getAttribute("code") ?? "",
      name: bookElem.getAttribute("name") ?? "",
      chaptersCount: chapterElems.length,
      versesInChapter: Array.from(bookElem.querySelectorAll("chapter")).reduce(
        (acc, chapterElem) => {
          const chapterNo = parseInt(chapterElem.getAttribute("no") ?? "0", 10);
          const versesCount = parseInt(
            chapterElem.getAttribute("verses") ?? "0",
            10,
          );
          acc[chapterNo] = versesCount;
          return acc;
        },
        {} as Record<number, number>,
      ),
    };

    books.push(bookInfo);
    bookByCode[bookInfo.code] = bookInfo;
    bookByNumber[bookInfo.bookNumber] = bookInfo;
  });

  return { books, bookByCode, bookByNumber };
}

export function BooksListProvider({ children }: OnlyChildren) {
  const { transCode, langCode } = useContext(SelectedTranslationContext);

  const { value } = useAsync(async () => {
    const content = await fetchAndParseXML(
      `/translation?trans=${transCode}&lang=${langCode}`,
    );
    return parseBooksInfo(content);
  }, [transCode, langCode]);

  return (
    <BooksListContext.Provider
      value={value ? { loaded: true, ...value } : { loaded: false }}
    >
      {children}
    </BooksListContext.Provider>
  );
}
