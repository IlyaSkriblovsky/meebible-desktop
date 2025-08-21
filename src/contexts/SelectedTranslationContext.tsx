import { createContext } from "react";
import { OnlyChildren } from "../utils.ts";
import { noop } from "ts-essentials";
import { useLocalStorage } from "react-use";

interface SelectedTranslation {
  transCode: string;
  langCode: string;

  switchTranslation(transCode: string, langCode: string): void;
}

const defaultValue: SelectedTranslation = {
  transCode: "nwt",
  langCode: "e",

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

  const switchTranslation = (newTransCode: string, newLangCode: string) => {
    setTransCode(newTransCode);
    setLangCode(newLangCode);
  };

  return (
    <SelectedTranslationContext.Provider
      value={{
        transCode,
        langCode,
        switchTranslation,
      }}
    >
      {children}
    </SelectedTranslationContext.Provider>
  );
}
