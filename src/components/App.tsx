import { alpha, Box, createTheme, CssBaseline, ThemeProvider, useMediaQuery } from "@mui/material";
import { blue, cyan, deepOrange, indigo, purple } from "@mui/material/colors";
import { getCurrentWindow } from "@tauri-apps/api/window";
import * as React from "react";

import "../App.css";
import { useMount } from "react-use";

import { BookmarksProvider } from "../contexts/BookmarksContext.tsx";
import { BooksListProvider } from "../contexts/BooksContext.tsx";
import { ChapterTextProvider } from "../contexts/ChapterTextContext.tsx";
import { DatabaseProvider } from "../contexts/DatabaseContext.tsx";
import { LocationProvider } from "../contexts/LocationContext.tsx";
import { SelectedTranslationProvider } from "../contexts/SelectedTranslationContext.tsx";
import { TranslationsListProvider } from "../contexts/TranslationsListContext.tsx";
import { useDisableContextMenu } from "../utils.ts";
import { ChapterContent } from "./ChapterContent.tsx";
import { StartupSender } from "./StartupSender.tsx";
import { Topbar } from "./Topbar.tsx";

function Home() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <Topbar />

      <Box sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        <ChapterContent />
      </Box>
    </Box>
  );
}

function Shell() {
  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        bgcolor: "background.default",
      }}
    >
      <Home />
    </Box>
  );
}

declare module "@mui/material/styles" {
  interface PaletteOptions {
    chapter?: PaletteOptions["primary"];
    book1?: PaletteOptions["primary"];
    book2?: PaletteOptions["primary"];
    book3?: PaletteOptions["primary"];
    book4?: PaletteOptions["primary"];
  }
}
declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    chapter: true;
    book1: true;
    book2: true;
    book3: true;
    book4: true;
  }
}

export function App() {
  useMount(() => {
    setTimeout(() => {
      getCurrentWindow().show().then();
    }, 20);
  });

  useDisableContextMenu();

  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const mainColor = prefersDarkMode ? blue[200] : blue["700"];

  const theme = React.useMemo(
    () =>
      createTheme({
        cssVariables: true,
        components: {
          MuiButtonBase: {
            defaultProps: {
              disableRipple: true,
            },
          },
        },
        palette: {
          primary: { main: mainColor },
          chapter: { main: alpha(mainColor, 0.2) },
          book1: { main: alpha(indigo[300], 0.2) },
          book2: { main: alpha(cyan[200], 0.2) },
          book3: { main: alpha(purple[200], 0.2) },
          book4: { main: alpha(deepOrange[200], 0.2) },
          mode: prefersDarkMode ? "dark" : "light",
        },
        shape: { borderRadius: 14 },
      }),
    [prefersDarkMode],
  );

  React.useEffect(() => {
    const scheme = prefersDarkMode ? "dark" : "light";
    document.documentElement.setAttribute("theme", scheme);
  }, [prefersDarkMode]);

  return (
    <DatabaseProvider>
      <TranslationsListProvider>
        <SelectedTranslationProvider>
          <StartupSender />
          <BooksListProvider>
            <LocationProvider>
              <BookmarksProvider>
                <ChapterTextProvider>
                  <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <Shell />
                  </ThemeProvider>
                </ChapterTextProvider>
              </BookmarksProvider>
            </LocationProvider>
          </BooksListProvider>
        </SelectedTranslationProvider>
      </TranslationsListProvider>
    </DatabaseProvider>
  );
}
