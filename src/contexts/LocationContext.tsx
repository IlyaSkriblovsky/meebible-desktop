import { createContext, useContext, useEffect } from "react";
import { OnlyChildren } from "../utils.ts";
import { BooksListContext } from "./BooksContext.tsx";
import { useLocalStorage } from "react-use";

interface Location {
  bookCode: string;
  chapterNo: number;
}

const defaultLocation: Location = {
  bookCode: "ge",
  chapterNo: 1,
};

interface LocationContextType {
  location: Location;
  hasPrevChapter: boolean;
  hasNextChapter: boolean;

  goNextChapter(): void;

  goPrevChapter(): void;

  goToBook(bookCode: string, chapterNo?: number): void;

  goToChapter(chapterNo: number): void;
}

export const LocationContext = createContext<LocationContextType>({
  location: defaultLocation,
  hasPrevChapter: false,
  hasNextChapter: false,

  goNextChapter: () => {},
  goPrevChapter: () => {},
  goToBook: () => {},
  goToChapter: () => {},
});

export function LocationProvider({ children }: OnlyChildren) {
  const [locationOrEmpty, setLocation] = useLocalStorage(
    "location",
    defaultLocation,
  );
  const location = locationOrEmpty ?? defaultLocation;

  const { chapterNo, bookCode } = location;

  const booksInfo = useContext(BooksListContext);

  useEffect(() => {
    if (!booksInfo.loaded) return;
    if (!booksInfo.bookByCode[bookCode]) {
      // If the book code is not found, reset to the first book
      setLocation({
        bookCode: booksInfo.books[0].code,
        chapterNo: 1,
      });
    }
  }, [booksInfo]);

  const curBookInfo = booksInfo.loaded
    ? booksInfo.bookByCode[bookCode]
    : undefined;

  const hasPrevChapter =
    chapterNo > 1 || (booksInfo.loaded && (curBookInfo?.bookNumber ?? 0) > 1);

  const hasNextChapter =
    booksInfo.loaded &&
    (chapterNo < (curBookInfo?.chaptersCount ?? 0) ||
      (curBookInfo?.bookNumber ?? 0) < booksInfo.books.length);

  const goPrevChapter = () => {
    if (!booksInfo.loaded) return;
    const bookInfo = booksInfo.bookByCode[bookCode];
    if (!bookInfo) return;
    const prevChapterNo = chapterNo - 1;
    if (prevChapterNo < 1) {
      const prevBook = booksInfo.bookByNumber[bookInfo.bookNumber - 1];
      if (!prevBook) return;
      setLocation({
        ...location,
        bookCode: prevBook.code,
        chapterNo: prevBook.chaptersCount,
      });
    } else {
      setLocation({
        ...location,
        chapterNo: prevChapterNo,
      });
    }
  };

  const goNextChapter = () => {
    if (!booksInfo.loaded) return;
    const bookInfo = booksInfo.bookByCode[bookCode];
    if (!bookInfo) return;
    const nextChapterNo = chapterNo + 1;
    if (nextChapterNo > bookInfo.chaptersCount) {
      const nextBook = booksInfo.bookByNumber[bookInfo.bookNumber + 1];
      if (!nextBook) return;
      setLocation({
        ...location,
        bookCode: nextBook.code,
        chapterNo: 1,
      });
    } else {
      setLocation({
        ...location,
        chapterNo: nextChapterNo,
      });
    }
  };

  const goToBook = (bookCode: string, chapterNo: number = 1) => {
    if (!booksInfo.loaded) return;
    const bookInfo = booksInfo.bookByCode[bookCode];
    if (!bookInfo) return;
    setLocation({
      ...location,
      bookCode: bookInfo.code,
      chapterNo: Math.min(chapterNo, bookInfo.chaptersCount),
    });
  };

  const goToChapter = (chapterNo: number) => goToBook(bookCode, chapterNo);

  return (
    <LocationContext.Provider
      value={{
        location,
        hasPrevChapter,
        hasNextChapter,
        goNextChapter,
        goPrevChapter,
        goToBook,
        goToChapter,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}
