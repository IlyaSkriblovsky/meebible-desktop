import { createContext, useContext } from "react";
import { useLocalStorage } from "react-use";

import { Language, Translation, TranslationLanguage } from "../api/translations-list.ts";
import { OnlyChildren } from "../utils.ts";
import { useTranslationsListContext } from "./TranslationsListContext.tsx";

interface SelectedTranslation {
  transCode: string;
  langCode: string;

  language: Language | null;
  translation: Translation | null;
  transLang: TranslationLanguage | null;

  switchTranslation(transCode: string, langCode: string): void;
}

const SelectedTranslationContext = createContext<SelectedTranslation | null>(null);

export function useSelectedTranslationContext(): SelectedTranslation {
  const context = useContext(SelectedTranslationContext);
  if (!context) {
    throw new Error("useSelectedTranslationContext must be used within a SelectedTranslationProvider");
  }
  return context;
}

const DEFAULT_TRANSLATION = "nwt";
const DEFAULT_LANGUAGE = "e";

export function SelectedTranslationProvider({ children }: OnlyChildren) {
  const [transCodeOrEmpty, setTransCode] = useLocalStorage("transCode", DEFAULT_TRANSLATION);
  const [langCodeOrEmpty, setLangCode] = useLocalStorage("langCode", DEFAULT_LANGUAGE);

  const transCode = transCodeOrEmpty ?? DEFAULT_TRANSLATION;
  const langCode = langCodeOrEmpty ?? DEFAULT_LANGUAGE;

  const translationsContext = useTranslationsListContext();
  const translation = translationsContext.loaded
    ? (translationsContext.translations.find((t) => t.code === transCode) ?? null)
    : null;
  const language = translationsContext.loaded
    ? (translationsContext.languages.find((l) => l.code === langCode) ?? null)
    : null;
  const transLang = translation?.languages.find((transLang) => transLang.language.code === langCode) ?? null;

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
