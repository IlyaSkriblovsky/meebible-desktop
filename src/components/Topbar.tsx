import {
  alpha,
  AppBar,
  IconButton,
  InputBase,
  styled,
  Toolbar,
  Typography,
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ChangeEvent, useCallback, useContext } from "react";

import { BooksListContext } from "../contexts/BooksContext.tsx";
import { LocationContext } from "../contexts/LocationContext.tsx";
import { TranslationSelector } from "./TranslationSelector.tsx";

const ChapterInput = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.background.default, 1),
  width: "3em",
}));
const ChapterInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1),
    width: "100%",
    textAlign: "center",
  },
}));

export function Topbar() {
  const {
    location: { bookCode, chapterNo },
    hasNextChapter,
    hasPrevChapter,
    goNextChapter,
    goPrevChapter,
    goToChapter,
  } = useContext(LocationContext);
  const booksInfo = useContext(BooksListContext);

  const onChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      goToChapter(parseInt(event.target.value));
    },
    [goToChapter],
  );

  return (
    <AppBar color="default" elevation={0} enableColorOnDark position="sticky">
      <Toolbar>
        <Typography variant="h6">
          {booksInfo.loaded ? booksInfo.bookByCode[bookCode]?.name : null}
        </Typography>

        <IconButton disabled={!hasPrevChapter} onClick={goPrevChapter}>
          <ChevronLeft />
        </IconButton>
        <ChapterInput>
          <ChapterInputBase onChange={onChange} value={chapterNo} />
        </ChapterInput>
        <IconButton disabled={!hasNextChapter} onClick={goNextChapter}>
          <ChevronRight />
        </IconButton>

        <div style={{ flex: 1 }} />

        <TranslationSelector />
        {/*<TranslationSelector />*/}
      </Toolbar>
    </AppBar>
  );
}
