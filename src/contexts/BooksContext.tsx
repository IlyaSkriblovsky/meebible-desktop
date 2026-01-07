import { createContext, useContext } from "react";
import { useAsync } from "react-use";

import { BooksInfo, fetchBooksInfo } from "../api/books-info.ts";
import { OnlyChildren } from "../utils.ts";
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

export function BooksListProvider({ children }: OnlyChildren) {
  const { transCode, langCode } = useSelectedTranslationContext();

  const { value } = useAsync(() => fetchBooksInfo(transCode, langCode), [transCode, langCode]);

  return (
    <BooksListContext.Provider value={value ? { loaded: true, ...value } : { loaded: false }}>
      {children}
    </BooksListContext.Provider>
  );
}
