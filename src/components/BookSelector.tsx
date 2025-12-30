import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Box, Button, ButtonOwnProps, Divider, Popover, Typography } from "@mui/material";
import { Fragment, MouseEvent, useState } from "react";

import { BookInfo, useBooksListContext } from "../contexts/BooksContext.tsx";
import { useLocationContext } from "../contexts/LocationContext.tsx";

// prettier-ignore
const groups: [ButtonOwnProps["color"], string[]][] = [
  ["book1", ["ge", "ex", "le", "nu", "de"]],
  ["book2", ["jos", "jg", "ru", "1sa", "2sa", "1ki", "2ki", "1ch", "2ch", "ezr", "ne", "es"]],
  ["book3", ["job", "ps", "pr", "ec", "ca"]],
  ["book4", ["isa", "jer", "la", "eze", "da", "ho", "joe", "am", "ob", "jon", "mic", "na", "hab", "zep", "hag", "zec", "mal"]],
  ["book1", ["mt", "mr", "lu", "joh"]],
  ["book2", ["ac"]],
  ["book3", ["ro", "1co", "2co", "ga", "eph", "php", "col", "1th", "2th", "1ti", "2ti", "tit", "phm", "heb", "jas", "1pe", "2pe", "1jo", "2jo", "3jo", "jude"]],
  ["book4", ["re"]],
];

// prettier-ignore
const parts = [
  ["ge", "ex", "le", "nu", "de", "jos", "jg", "ru", "1sa", "2sa", "1ki", "2ki", "1ch",
    "2ch", "ezr", "ne", "es", "job", "ps", "pr", "ec", "ca", "isa", "jer", "la", "eze",
    "da", "ho", "joe", "am", "ob", "jon", "mic", "na", "hab", "zep", "hag", "zec", "mal"],

  ["mt", "mr", "lu", "joh", "ac", "ro", "1co", "2co", "ga", "eph", "php", "col", "1th",
    "2th", "1ti", "2ti", "tit", "phm", "heb", "jas", "1pe", "2pe", "1jo", "2jo", "3jo", "jude", "re"],
];

const groupByBookCode: Record<string, ButtonOwnProps["color"] | undefined> = Object.fromEntries(
  (function* () {
    for (const [groupColor, bookCodes] of groups) {
      for (const bookCode of bookCodes) {
        yield [bookCode, groupColor];
      }
    }
  })(),
);

type Part = "hebrew" | "greek" | undefined;

const partByBookCode: Record<string, Part> = Object.fromEntries(
  (function* () {
    for (let i = 0; i < parts.length; i++) {
      for (const bookCode of parts[i]) {
        yield [bookCode, i === 0 ? "hebrew" : "greek"];
      }
    }
  })(),
);

function* iterateBooksParts(books: BookInfo[]): Generator<[Part, BookInfo[]]> {
  if (books.length === 0) {
    return;
  }
  if (books.length === 1) {
    yield [partByBookCode[books[0].code], books];
    return;
  }

  let currentPart: Part = partByBookCode[books[0].code];
  let currentPartBooks: BookInfo[] = [];

  for (const book of books) {
    const bookPart = partByBookCode[book.code];
    if (bookPart !== currentPart) {
      yield [currentPart, currentPartBooks];
      currentPartBooks = [];
      currentPart = bookPart;
    }
    currentPartBooks.push(book);
  }

  if (currentPartBooks.length > 0) {
    yield [currentPart, currentPartBooks];
  }
}

export function BookSelector() {
  const { location, goToBook } = useLocationContext();
  const booksInfo = useBooksListContext();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleBookSelect = (bookCode: string) => {
    goToBook(bookCode, 1);
    handleClose();
  };

  const open = Boolean(anchorEl);
  const id = open ? "book-selector-popover" : undefined;

  if (!booksInfo.loaded) {
    return (
      <Button disabled variant="outlined">
        Loading Books...
      </Button>
    );
  }

  const { books, bookByCode } = booksInfo;
  const currentBookName = bookByCode[location.bookCode]?.name;

  return (
    <>
      <Button aria-describedby={id} endIcon={<KeyboardArrowDownIcon />} onClick={handleClick} variant="outlined">
        {currentBookName || "Select a Book"}
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
        {Array.from(iterateBooksParts(books)).map(([, booksInPart], index) => (
          <Fragment key={index}>
            {index > -1 ? <Divider /> : null}
            <Box
              role="grid"
              sx={{
                p: 1,
                maxWidth: "900px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(8em, 8em))",
                gap: "12px",
              }}
            >
              {booksInPart.map((book: BookInfo) => (
                <Button
                  aria-label={`Select book ${book.name}`}
                  color={groupByBookCode[book.code] ?? "book1"}
                  fullWidth
                  key={book.code}
                  onClick={() => handleBookSelect(book.code)}
                  sx={{ whiteSpace: "nowrap", justifyContent: "start" }}
                  variant="contained"
                >
                  <Typography sx={{ overflow: "hidden" }} variant="caption">
                    {book.name}
                  </Typography>
                </Button>
              ))}
              <div style={{ flex: 1 }} />
            </Box>
          </Fragment>
        ))}
      </Popover>
    </>
  );
}
