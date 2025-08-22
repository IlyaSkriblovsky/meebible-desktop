import * as React from "react";
import { useContext } from "react";
import {
  Box,
  createTheme,
  CssBaseline,
  ThemeProvider,
  useMediaQuery,
} from "@mui/material";
import "../App.css";
import { Sidebar } from "./Sidebar.tsx";
import { useAppVersion, useDisableContextMenu } from "../utils.ts";
import { Topbar } from "./Topbar.tsx";
import { TranslationsListProvider } from "../contexts/TranslationsListContext.tsx";
import { LocationProvider } from "../contexts/LocationContext.tsx";
import { BooksListProvider } from "../contexts/BooksContext.tsx";
import {
  ChapterTextContext,
  ChapterTextProvider,
} from "../contexts/ChapterTextContext.tsx";
import { useMount } from "react-use";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { SelectedTranslationProvider } from "../contexts/SelectedTranslationContext.tsx";
import { StartupSender } from "./StartupSender.tsx";

function Home() {
  const chapterText = useContext(ChapterTextContext);

  return (
    <>
      <Topbar />
      {chapterText.loaded ? (
        <Box
          className="bible-text"
          sx={{ px: 3 }}
          dangerouslySetInnerHTML={{ __html: chapterText.text }}
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
      <Sidebar width={sidebarWidth} appVersion={appVersion} />

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
