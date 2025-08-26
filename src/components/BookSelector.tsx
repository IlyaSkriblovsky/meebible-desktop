import { Box, Button, Popover, Typography } from "@mui/material";
import { useContext, useState } from "react";
import { BooksListContext, BookInfo } from "../contexts/BooksContext.tsx";
import { LocationContext } from "../contexts/LocationContext.tsx";

export function BookSelector() {
  const { location, goToBook } = useContext(LocationContext);
  const booksInfo = useContext(BooksListContext);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleBookSelect = (bookCode: string) => {
    goToBook(bookCode, 1);
    handleClose();
  };

  const open = Boolean(anchorEl);
  const id = open ? "book-selector-popover" : undefined;

  if (!booksInfo.loaded) {
    return <Button variant="contained" disabled>Loading Books...</Button>;
  }

  const { books, bookByCode } = booksInfo;
  const currentBookName = bookByCode[location.bookCode]?.name;

  return (
    <>
      <Button aria-describedby={id} variant="contained" onClick={handleClick}>
        {currentBookName || "Select a Book"}
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
          {books.map((book: BookInfo) => (
            <Box key={book.code} sx={{ flexBasis: '16.66%', p: 0.5 }}>
              <Button
                variant="outlined"
                onClick={() => handleBookSelect(book.code)}
                fullWidth
              >
                <Typography variant="caption">{book.name}</Typography>
              </Button>
            </Box>
          ))}
        </Box>
      </Popover>
    </>
  );
}
