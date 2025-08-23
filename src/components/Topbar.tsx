import {
  alpha,
  AppBar,
  IconButton,
  InputBase,
  MenuItem,
  Select,
  SelectChangeEvent,
  styled,
  Toolbar,
  Typography,
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TranslationsListContext } from "../contexts/TranslationsListContext.tsx";
import { ChangeEvent, useCallback, useContext } from "react";
import { LocationContext } from "../contexts/LocationContext.tsx";
import { BooksListContext } from "../contexts/BooksContext.tsx";
import { SelectedTranslationContext } from "../contexts/SelectedTranslationContext.tsx";

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

function TranslationSelector() {
  const translationsContext = useContext(TranslationsListContext);
  const { transCode, langCode, switchTranslation } = useContext(
    SelectedTranslationContext,
  );

  const onChange = useCallback(
    (event: SelectChangeEvent) => {
      const [transCode, langCode] = event.target.value.split("|");
      switchTranslation(transCode, langCode);
    },
    [translationsContext],
  );

  // FIXME: sorting
  // FIXME: filter by language?
  return (
    <>
      {translationsContext.loaded ? (
        <Select value={`${transCode}|${langCode}`} onChange={onChange}>
          {translationsContext.translations.flatMap((trans) =>
            trans.languages.map((transLang) => (
              <MenuItem
                key={`${trans.code}|${transLang.language.code}`}
                value={`${trans.code}|${transLang.language.code}`}
                sx={{ flexDirection: "column", alignItems: "start" }}
              >
                <Typography sx={{ display: "block" }}>
                  {transLang.name}
                </Typography>
                <Typography variant={"caption"}>
                  {transLang.language.selfname} | {transLang.language.name}
                </Typography>
              </MenuItem>
            )),
          )}
        </Select>
      ) : null}
    </>
  );
}

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
    <AppBar position="sticky" color="default" elevation={0} enableColorOnDark>
      <Toolbar>
        <Typography variant="h6">
          {booksInfo.loaded ? booksInfo.bookByCode[bookCode]?.name : null}
        </Typography>

        <IconButton onClick={goPrevChapter} disabled={!hasPrevChapter}>
          <ChevronLeft />
        </IconButton>
        <ChapterInput>
          <ChapterInputBase value={chapterNo} onChange={onChange} />
        </ChapterInput>
        <IconButton onClick={goNextChapter} disabled={!hasNextChapter}>
          <ChevronRight />
        </IconButton>

        <div style={{ flex: 1 }} />

        <TranslationSelector />
      </Toolbar>
    </AppBar>
  );
}
