import { createContext, useContext } from "react";
import { useAsync } from "react-use";

import { fetchTranslationsList, LangsAndTranslations } from "../api/translations-list.ts";
import { OnlyChildren } from "../utils.ts";

type TranslationsListContextType =
  | {
      loaded: false;
    }
  | ({
      loaded: true;
    } & LangsAndTranslations);

const TranslationsListContext = createContext<TranslationsListContextType | null>(null);

export function useTranslationsListContext(): TranslationsListContextType {
  const context = useContext(TranslationsListContext);
  if (!context) {
    throw new Error("useTranslationsListContext must be used within a TranslationsListProvider");
  }
  return context;
}

export function TranslationsListProvider({ children }: OnlyChildren) {
  const { value /*loading, error*/ } = useAsync(fetchTranslationsList, []);

  return (
    <TranslationsListContext.Provider value={value ? { loaded: true, ...value } : { loaded: false }}>
      {children}
    </TranslationsListContext.Provider>
  );
}
