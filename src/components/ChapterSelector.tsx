import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Box, Button, Popover } from "@mui/material";
import { MouseEvent, useContext, useState } from "react";

import { BooksListContext } from "../contexts/BooksContext.tsx";
import { LocationContext } from "../contexts/LocationContext.tsx";

export function ChapterSelector() {
  const { location, goToChapter } = useContext(LocationContext);
  const booksInfo = useContext(BooksListContext);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) =>
    setAnchorEl(event.currentTarget);

  const handleClose = () => setAnchorEl(null);

  const handleChapterSelect = (chapter: number) => {
    goToChapter(chapter);
    handleClose();
  };

  const open = Boolean(anchorEl);
  const id = open ? "chapter-selector-popover" : undefined;

  if (!booksInfo.loaded) {
    return (
      <Button disabled variant="outlined">
        Chapter
      </Button>
    );
  }

  const { bookByCode } = booksInfo;
  const currentBook = bookByCode[location.bookCode];
  const chapters = currentBook
    ? Array.from({ length: currentBook.chaptersCount }, (_, i) => i + 1)
    : [];

  return (
    <>
      <Button
        aria-describedby={id}
        disabled={!currentBook}
        endIcon={<KeyboardArrowDownIcon />}
        onClick={handleClick}
        variant="outlined"
      >
        Chapter {location.chapterNo}
      </Button>
      <Popover
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        id={id}
        onClose={handleClose}
        open={open}
      >
        <Box
          role="grid"
          sx={{
            display: "grid",
            p: 1,
            maxWidth: "900px",
            gridTemplateColumns: "repeat(auto-fill, minmax(4em, 4em))",
            gap: "12px",
          }}
        >
          {chapters.map((chapter) => (
            <Button
              color="chapter"
              fullWidth
              key={chapter}
              onClick={() => handleChapterSelect(chapter)}
              variant="contained"
            >
              {chapter}
            </Button>
          ))}
        </Box>
      </Popover>
    </>
  );
}
