import { Box, Button, Popover } from "@mui/material";
import { useContext, useState } from "react";
import { BooksListContext } from "../contexts/BooksContext.tsx";
import { LocationContext } from "../contexts/LocationContext.tsx";

export function ChapterSelector() {
  const { location, goToChapter } = useContext(LocationContext);
  const booksInfo = useContext(BooksListContext);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChapterSelect = (chapter: number) => {
    goToChapter(chapter);
    handleClose();
  };

  const open = Boolean(anchorEl);
  const id = open ? "chapter-selector-popover" : undefined;

  if (!booksInfo.loaded) {
    return <Button variant="contained" disabled>Chapter</Button>;
  }

  const { bookByCode } = booksInfo;
  const currentBook = bookByCode[location.bookCode];
  const chapters = currentBook ? Array.from({ length: currentBook.chaptersCount }, (_, i) => i + 1) : [];

  return (
    <>
      <Button aria-describedby={id} variant="contained" onClick={handleClick} disabled={!currentBook}>
        Chapter {location.chapterNo}
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', p: 1, maxWidth: '80vw' }}>
          {chapters.map((chapter) => (
            <Box key={chapter} sx={{ flexBasis: '16.66%', p: 0.5 }}>
              <Button
                variant="outlined"
                onClick={() => handleChapterSelect(chapter)}
                fullWidth
              >
                {chapter}
              </Button>
            </Box>
          ))}
        </Box>
      </Popover>
    </>
  );
}
