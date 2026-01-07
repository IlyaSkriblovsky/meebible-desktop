import { fetchAndParseXML } from "./utils.ts";

export interface BookInfo {
  bookNumber: number;
  code: string;
  name: string;
  chaptersCount: number;
  versesInChapter: Record<number, number>;
}

export interface BooksInfo {
  books: BookInfo[];
  bookByCode: Record<string, BookInfo | undefined>;
  bookByNumber: Record<number, BookInfo | undefined>;
}

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
          const versesCount = parseInt(chapterElem.getAttribute("verses") ?? "0", 10);
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

export async function fetchBooksInfo(transCode: string, langCode: string): Promise<BooksInfo> {
  const content = await fetchAndParseXML(`/translation?trans=${transCode}&lang=${langCode}`);
  return parseBooksInfo(content);
}
