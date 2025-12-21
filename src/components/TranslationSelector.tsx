import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SearchIcon from "@mui/icons-material/Search";
import {
  Button,
  Collapse,
  Divider,
  Input,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Menu,
} from "@mui/material";
import React, { useMemo, useState } from "react";
import { useToggle } from "react-use";

import { useSelectedTranslationContext } from "../contexts/SelectedTranslationContext.tsx";
import { Language, TranslationLanguage, useTranslationsListContext } from "../contexts/TranslationsListContext.tsx";
import { lowerCaseRemoveDiacritics } from "../utils.ts";

interface TranslationsListProps {
  language: Language;

  onSelect: (transLang: TranslationLanguage) => void;
}

function TranslationsList({ language, onSelect }: TranslationsListProps) {
  return (
    <List component="div" disablePadding>
      {language.translations.map((transLang) => (
        <ListItemButton key={transLang.translation.code} onClick={() => onSelect(transLang)} sx={{ pl: 4 }}>
          <ListItemText primary={transLang.name} secondary={transLang.translation.copyright} />
        </ListItemButton>
      ))}
    </List>
  );
}

function LanguageAccordion({ language, onSelect }: TranslationsListProps) {
  const [open, toggle] = useToggle(false);
  return (
    <>
      <ListItemButton onClick={toggle}>
        <ListItemText primary={language.selfname} secondary={language.name} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <TranslationsList language={language} onSelect={onSelect} />
      </Collapse>
    </>
  );
}

export function TranslationSelector() {
  const translationsContext = useTranslationsListContext();
  const { language, transLang, switchTranslation } = useSelectedTranslationContext();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
    setSearch("");
  };

  const [search, setSearch] = useState("");

  const languages = useMemo(() => {
    const searchWithoutDiacritics = lowerCaseRemoveDiacritics(search.trim());
    const langs = translationsContext.loaded ? translationsContext.languages : [];
    if (!searchWithoutDiacritics) {
      return langs;
    }
    return langs.filter(
      (lang) =>
        lowerCaseRemoveDiacritics(lang.name).includes(
          lowerCaseRemoveDiacritics(search)
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, ""),
        ) || lowerCaseRemoveDiacritics(lang.selfname).includes(lowerCaseRemoveDiacritics(search)),
    );
  }, [search, translationsContext]);

  const onSelectTranslation = (transLang: TranslationLanguage) => {
    switchTranslation(transLang.translation.code, transLang.language.code);
    handleClose();
  };

  return (
    <>
      <Button endIcon={<KeyboardArrowDownIcon />} onClick={handleClick} variant="outlined">
        {transLang?.name ?? "Loading..."}
      </Button>

      <Menu anchorEl={anchorEl} onClose={handleClose} open={open}>
        {language
          ? [
              <ListSubheader key="cur-lang-name">{language.selfname}</ListSubheader>,
              <TranslationsList key="cur-lang-list" language={language} onSelect={onSelectTranslation} />,
              <Divider key="divider" />,
            ]
          : null}
        <ListItem key="search">
          <Input
            fullWidth
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder={"Search"}
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            }
            value={search}
          />
        </ListItem>
        {languages
          .filter((lang) => lang.translations.length > 0)
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((lang) => (
            <LanguageAccordion key={lang.code} language={lang} onSelect={onSelectTranslation} />
          ))}
      </Menu>
    </>
  );
}
