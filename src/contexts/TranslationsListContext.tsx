import { createContext, useContext, useEffect } from "react";
import { useAsync, useAsyncRetry } from "react-use";
import { SafeDictionary } from "ts-essentials";

import {
  fetchTranslationsList,
  LangsAndTranslations,
  Language,
  Translation,
  TranslationLanguage,
} from "../api/translations-list.ts";
import { AppRuntime, appRuntime, assertNever, OnlyChildren } from "../utils.ts";
import { ExecuteSQL, Select, SQLValue, useDatabaseContext } from "./DatabaseContext.tsx";

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

const SELECT_ALL_LANGUAGES = `
  SELECT
    l.code as langCode, l.engname as langEngName, l.selfname as langSelfName,
    t.transCode, t.sourceUrl, t.copyright, t.rtl,
    tl.name AS transLangName
  FROM translationLanguages as tl
  LEFT JOIN languages as l ON l.code = tl.langCode
  LEFT JOIN translations as t ON tl.transCode = t.transCode
  ORDER BY langEngName, transLangName
`;

interface TranslationLanguageRow {
  langCode: string;
  langEngName: string;
  langSelfName: string;

  transCode: string;
  sourceUrl: string | null;
  copyright: string | null;
  rtl: number;

  transLangName: string;
}

async function loadCachedTranslationsList(select: Select): Promise<LangsAndTranslations> {
  const rows = (await select(SELECT_ALL_LANGUAGES)) as TranslationLanguageRow[];

  const langByCode: SafeDictionary<Language> = {};
  const transByCode: SafeDictionary<Translation> = {};

  for (const row of rows) {
    let language = langByCode[row.langCode];
    if (!language) {
      language = {
        code: row.langCode,
        name: row.langEngName,
        selfname: row.langSelfName,
        translations: [],
      };
      langByCode[row.langCode] = language;
    }

    let translation = transByCode[row.langCode];
    if (!translation) {
      translation = {
        code: row.transCode,
        sourceUrl: row.sourceUrl,
        copyright: row.copyright,
        rtl: Boolean(row.rtl),
        languages: [],
      };
      transByCode[row.transCode] = translation;
    }
  }

  for (const row of rows) {
    const language = langByCode[row.langCode]!;
    const translation = transByCode[row.transCode]!;
    const transLang: TranslationLanguage = {
      language,
      translation,
      name: row.transLangName,
    };
    translation.languages.push(transLang);
    language.translations.push(transLang);
  }

  return {
    languages: Object.values(langByCode).filter((lang): lang is Language => lang != null),
    translations: Object.values(transByCode).filter((trans): trans is Translation => trans != null),
  };
}

async function saveTranslationListToCache(
  executeSql: ExecuteSQL,
  langsAndTranslations: LangsAndTranslations,
): Promise<void> {
  const sqls: string[] = [];
  const params: SQLValue[] = [];

  sqls.push("DELETE FROM translationLanguages;");
  sqls.push("DELETE FROM languages;");
  sqls.push("DELETE FROM translations;");

  for (const language of langsAndTranslations.languages) {
    sqls.push("INSERT INTO languages (code, engname, selfname) VALUES (?, ?, ?);");
    params.push(language.code, language.name, language.selfname);
  }

  for (const translation of langsAndTranslations.translations) {
    sqls.push("INSERT INTO translations (transCode, sourceUrl, copyright, rtl) VALUES (?, ?, ?, ?);");
    params.push(translation.code, translation.sourceUrl, translation.copyright, translation.rtl ? 1 : 0);

    for (const transLang of translation.languages) {
      sqls.push("INSERT INTO translationLanguages (transCode, langCode, name) VALUES (?, ?, ?);");
      params.push(translation.code, transLang.language.code, transLang.name);
    }
  }

  const fullSql = sqls.join("\n");
  await executeSql(fullSql, params);
}

function CachedTranslationsListProvider({ children }: OnlyChildren) {
  const { select, executeSql } = useDatabaseContext();

  const { value, error } = useAsyncRetry(async () => {
    const cached = await loadCachedTranslationsList(select);
    if (cached.translations.length > 0) {
      return cached;
    }

    const fetched = await fetchTranslationsList();
    await saveTranslationListToCache(executeSql, fetched);
    return fetched;
  }, [select, executeSql]);

  useEffect(console.error, [error]);

  return (
    <TranslationsListContext.Provider value={value ? { loaded: true, ...value } : { loaded: false }}>
      {children}
    </TranslationsListContext.Provider>
  );
}

function NonCachedTranslationsListProvider({ children }: OnlyChildren) {
  const { value /*loading, error*/ } = useAsync(fetchTranslationsList, []);

  return (
    <TranslationsListContext.Provider value={value ? { loaded: true, ...value } : { loaded: false }}>
      {children}
    </TranslationsListContext.Provider>
  );
}

export function TranslationsListProvider({ children }: OnlyChildren) {
  switch (appRuntime) {
    case AppRuntime.TAURI:
      return <CachedTranslationsListProvider>{children}</CachedTranslationsListProvider>;
    case AppRuntime.WEB:
      return <NonCachedTranslationsListProvider>{children}</NonCachedTranslationsListProvider>;
    default:
      assertNever(appRuntime);
  }
}
