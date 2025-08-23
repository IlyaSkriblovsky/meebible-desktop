import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { BookOpen } from "lucide-react";
import { useContext } from "react";

import { BooksListContext } from "../contexts/BooksContext.tsx";
import { LocationContext } from "../contexts/LocationContext.tsx";

function BookList() {
  const booksContext = useContext(BooksListContext);
  const {
    location: { bookCode },
    goToBook,
  } = useContext(LocationContext);

  return (
    <List dense>
      {booksContext.loaded
        ? booksContext.books.map((bookInfo) => (
            <ListItemButton
              key={bookInfo.code}
              onClick={() => goToBook(bookInfo.code, 1)}
              selected={bookInfo.code === bookCode}
            >
              <ListItemText primary={bookInfo.name} />
            </ListItemButton>
          ))
        : null}
    </List>
  );
}

export function Sidebar(props: {
  width: number;
  appVersion: string | undefined;
}) {
  return (
    <Box
      component="nav"
      sx={{
        width: props.width,
        minWidth: props.width,
        height: "100%",
        bgcolor: "var(--mui-palette-AppBar-defaultBg)",
        borderRight: 1,
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 2,
          py: 2,
          pb: 1,
        }}
      >
        <Typography
          sx={{
            fontWeight: 700,
            display: "flex",
            gap: ".4em",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <BookOpen />
          <span>MeeBible</span>
        </Typography>
      </Box>

      <Box sx={{ overflow: "auto" }}>
        <BookList />

        <Box sx={{ p: 1.5 }}>
          <Typography color="text.secondary" variant="caption">
            {props.appVersion != null ? `v${props.appVersion}` : null}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
