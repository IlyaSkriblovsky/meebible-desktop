import { createContext, useState } from "react";
import { OnlyChildren } from "../utils.ts";
import { noop } from "ts-essentials";

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
  const [transCode, setTransCode] = useState(defaultValue.transCode);
  const [langCode, setLangCode] = useState(defaultValue.langCode);

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
