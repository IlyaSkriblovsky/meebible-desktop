import { createContext, useContext } from "react";
import { useLocalStorage } from "react-use";
import { noop } from "ts-essentials";

import { OnlyChildren } from "../utils.ts";
import {
  Language,
  Translation,
  TranslationLanguage,
  TranslationsListContext,
} from "./TranslationsListContext.tsx";

interface SelectedTranslation {
  transCode: string;
  langCode: string;

  language: Language | null;
  translation: Translation | null;
  transLang: TranslationLanguage | null;

  switchTranslation(transCode: string, langCode: string): void;
}

const defaultValue: SelectedTranslation = {
  transCode: "nwt",
  langCode: "e",

  language: null,
  translation: null,
  transLang: null,

  switchTranslation: noop,
};

export const SelectedTranslationContext =
  createContext<SelectedTranslation>(defaultValue);

export function SelectedTranslationProvider({ children }: OnlyChildren) {
  const [transCodeOrEmpty, setTransCode] = useLocalStorage(
    "transCode",
    defaultValue.transCode,
  );
  const [langCodeOrEmpty, setLangCode] = useLocalStorage(
    "langCode",
    defaultValue.langCode,
  );

  const transCode = transCodeOrEmpty ?? defaultValue.transCode;
  const langCode = langCodeOrEmpty ?? defaultValue.langCode;

  const translationsContext = useContext(TranslationsListContext);
  const translation = translationsContext.loaded
    ? (translationsContext.translations.find((t) => t.code === transCode) ??
      null)
    : null;
  const language = translationsContext.loaded
    ? (translationsContext.languages.find((l) => l.code === langCode) ?? null)
    : null;
  const transLang =
    translation?.languages.find(
      (transLang) => transLang.language.code === langCode,
    ) ?? null;

  const switchTranslation = (newTransCode: string, newLangCode: string) => {
    setTransCode(newTransCode);
    setLangCode(newLangCode);
  };

  return (
    <SelectedTranslationContext.Provider
      value={{
        transCode,
        langCode,
        language,
        translation,
        transLang,
        switchTranslation,
      }}
    >
      {children}
    </SelectedTranslationContext.Provider>
  );
}
