import { AppBar, Stack, Toolbar } from "@mui/material";

import { BookSelector } from "./BookSelector.tsx";
import { ChapterSelector } from "./ChapterSelector.tsx";
import { PrevNextButtons } from "./PrevNextButtons.tsx";
import { TranslationSelector } from "./TranslationSelector.tsx";

export function Topbar() {
  return (
    <AppBar color="default" elevation={0} enableColorOnDark position="static">
      <Toolbar>
        <Stack direction={"row"} spacing={2} useFlexGap>
          <BookSelector />
          <ChapterSelector />
          <PrevNextButtons />
        </Stack>

        <div style={{ flex: 1 }} />

        <TranslationSelector />
      </Toolbar>
    </AppBar>
  );
}
