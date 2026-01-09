import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Box, Button, Popover } from "@mui/material";
import { MouseEvent, useCallback, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { useBooksListContext } from "../contexts/BooksContext.tsx";
import { useLocationContext } from "../contexts/LocationContext.tsx";

export function ChapterSelector() {
  const { location, goToChapter } = useLocationContext();
  const booksInfo = useBooksListContext();
  const [triggerEl, setTriggerEl] = useState<HTMLButtonElement | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget),
    [setAnchorEl],
  );
  const handleClose = useCallback(() => setAnchorEl(null), [setAnchorEl]);
  const toggleOpen = useCallback(() => {
    if (anchorEl) {
      handleClose();
    } else if (triggerEl) {
      setAnchorEl(triggerEl);
    }
  }, [anchorEl, handleClose, triggerEl]);
  useHotkeys("c", toggleOpen, [toggleOpen]);

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
  const chapters = currentBook ? Array.from({ length: currentBook.chaptersCount }, (_, i) => i + 1) : [];

  return (
    <>
      <Button
        aria-describedby={id}
        disabled={!currentBook}
        endIcon={<KeyboardArrowDownIcon />}
        onClick={handleClick}
        ref={setTriggerEl}
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
