import { createContext } from "react";
import { useAsync } from "react-use";

import { fetchAndParseXML, OnlyChildren } from "../utils.ts";

export interface Language {
  code: string;
  name: string; // english name
  selfname: string; // self name in native language
  translations: TranslationLanguage[];
}

export interface TranslationLanguage {
  language: Language;
  translation: Translation;
  name: string; // Translation name in specified language
}

export interface Translation {
  code: string;
  sourceUrl: string | null; // URL to the source of the translation
  copyright: string | null; // Copyright information
  rtl: boolean; // Right-to-left translation
  languages: TranslationLanguage[]; // Languages available for this translation
}

interface LangsAndTranslations {
  languages: Language[];
  translations: Translation[];
}

type TranslationsListContextType =
  | {
      loaded: false;
    }
  | ({
      loaded: true;
    } & LangsAndTranslations);

export const TranslationsListContext =
  createContext<TranslationsListContextType>({
    loaded: false,
  });

function parseLanguagesAndTranslations(xml: Document): LangsAndTranslations {
  const languages: Language[] = [];
  const languageByCode: Record<string, Language | undefined> = {};
  const translations: Translation[] = [];

  xml.querySelectorAll("language").forEach((langElem) => {
    const code = langElem.getAttribute("code");
    const name = langElem.getAttribute("name");

    if (code == null || name == null) {
      return;
    }

    const selfname = langElem.getAttribute("selfname") ?? name;
    const language = { code, name, selfname, translations: [] };
    languageByCode[code] = language;
    languages.push(language);
  });

  xml.querySelectorAll("trans").forEach((transElem) => {
    const code = transElem.getAttribute("code");
    const sourceUrl = transElem.getAttribute("sourceUrl") || null;
    const copyright = transElem.getAttribute("copyright") || null;
    const rtl = ["1", "true"].includes(
      transElem.getAttribute("rtl") ?? "false",
    );

    if (code == null) {
      return;
    }

    const translation: Translation = {
      code,
      sourceUrl,
      copyright,
      rtl,
      languages: [],
    };

    transElem.querySelectorAll("transLang").forEach((transLangElem) => {
      const langCode = transLangElem.getAttribute("code");
      const name = transLangElem.getAttribute("name");

      if (langCode == null || name == null) {
        return;
      }

      if (!languageByCode[langCode]) {
        console.warn(`Language code ${langCode} not found in language list.`);
        return;
      }

      const transLang: TranslationLanguage = {
        language: languageByCode[langCode],
        translation,
        name,
      };
      translation.languages.push(transLang);
      languageByCode[langCode]?.translations.push(transLang);
    });

    translations.push(translation);
  });

  return { languages, translations };
}

export function TranslationsListProvider({ children }: OnlyChildren) {
  const { value /*loading, error*/ } = useAsync(async () => {
    const content = await fetchAndParseXML("/meta");
    return parseLanguagesAndTranslations(content);
  }, []);

  return (
    <TranslationsListContext.Provider
      value={value ? { loaded: true, ...value } : { loaded: false }}
    >
      {children}
    </TranslationsListContext.Provider>
  );
}
