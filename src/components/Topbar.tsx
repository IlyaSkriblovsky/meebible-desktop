import { AppBar, Toolbar } from "@mui/material";

import { BookSelector } from "./BookSelector.tsx";
import { ChapterSelector } from "./ChapterSelector.tsx";
import { TranslationSelector } from "./TranslationSelector.tsx";

export function Topbar() {
  return (
    <AppBar color="default" elevation={0} enableColorOnDark position="sticky">
      <Toolbar>
        <BookSelector />
        <div style={{ width: "1em" }} />
        <ChapterSelector />

        <div style={{ flex: 1 }} />

        <TranslationSelector />
      </Toolbar>
    </AppBar>
  );
}
