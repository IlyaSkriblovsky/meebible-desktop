import {
  Box,
  createTheme,
  CssBaseline,
  ThemeProvider,
  useMediaQuery,
} from "@mui/material";
import { getCurrentWindow } from "@tauri-apps/api/window";
import * as React from "react";
import { useContext } from "react";

import "../App.css";
import { useMount } from "react-use";

import { BooksListProvider } from "../contexts/BooksContext.tsx";
import {
  ChapterTextContext,
  ChapterTextProvider,
} from "../contexts/ChapterTextContext.tsx";
import { LocationProvider } from "../contexts/LocationContext.tsx";
import { SelectedTranslationProvider } from "../contexts/SelectedTranslationContext.tsx";
import { TranslationsListProvider } from "../contexts/TranslationsListContext.tsx";
import { useAppVersion, useDisableContextMenu } from "../utils.ts";
import { Sidebar } from "./Sidebar.tsx";
import { StartupSender } from "./StartupSender.tsx";
import { Topbar } from "./Topbar.tsx";

function Home() {
  const chapterText = useContext(ChapterTextContext);

  return (
    <>
      <Topbar />
      {chapterText.loaded ? (
        <Box
          className="bible-text"
          dangerouslySetInnerHTML={{ __html: chapterText.text }}
          sx={{ px: 3 }}
        />
      ) : null}
    </>
  );
}

function Shell() {
  const sidebarWidth = 240;

  const appVersion = useAppVersion();

  return (
    <Box
      sx={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        bgcolor: "background.default",
      }}
    >
      <Sidebar appVersion={appVersion} width={sidebarWidth} />

      <Box sx={{ flex: 1, height: "100%", overflowY: "auto", p: 0 }}>
        <Home />
      </Box>
    </Box>
  );
}

export function App() {
  useMount(() => {
    setTimeout(() => {
      getCurrentWindow().show().then();
    }, 20);
  });

  useDisableContextMenu();

  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

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
          mode: prefersDarkMode ? "dark" : "light",
        },
        shape: { borderRadius: 14 },
      }),
    [prefersDarkMode],
  );

  return (
    <TranslationsListProvider>
      <SelectedTranslationProvider>
        <StartupSender />
        <BooksListProvider>
          <LocationProvider>
            <ChapterTextProvider>
              <ThemeProvider theme={theme}>
                <CssBaseline />
                <Shell />
              </ThemeProvider>
            </ChapterTextProvider>
          </LocationProvider>
        </BooksListProvider>
      </SelectedTranslationProvider>
    </TranslationsListProvider>
  );
}
