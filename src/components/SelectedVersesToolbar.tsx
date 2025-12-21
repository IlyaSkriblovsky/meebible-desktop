import { BookmarkAdd, BookmarkRemove, ContentCopy } from "@mui/icons-material";
import { Button, Paper, Stack } from "@mui/material";
import { ForwardedRef, forwardRef } from "react";

export type ToolbarPosition = { left: number; top: number; placement: "above" | "below" } | null;

interface SelectedVersesToolbarProps {
  position: ToolbarPosition;
  bookmarkAction: "add" | "remove";

  onCopy(): void;
  onBookmark(): void;
}

export const SelectedVersesToolbar = forwardRef(function SelectedVersesToolbar(
  props: SelectedVersesToolbarProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const { position, bookmarkAction, onCopy, onBookmark } = props;

  if (!position) {
    return null;
  }

  return (
    <Paper
      elevation={6}
      ref={ref}
      sx={{
        position: "absolute",
        top: position.top,
        left: position.left,
        transform: position.placement === "above" ? "translate(-50%, -100%)" : "translate(-50%, 0)",
        p: 1,
        borderRadius: 2,
        zIndex: 5,
      }}
    >
      <Stack direction="row" spacing={1}>
        <Button onClick={onCopy} size="small" startIcon={<ContentCopy fontSize="small" />} variant="outlined">
          Copy
        </Button>
        <Button
          color="warning"
          onClick={onBookmark}
          size="small"
          startIcon={bookmarkAction === "add" ? <BookmarkAdd fontSize="small" /> : <BookmarkRemove fontSize="small" />}
          variant="outlined"
        >
          {bookmarkAction === "add" ? "Bookmark" : "Unbookmark"}
        </Button>
      </Stack>
    </Paper>
  );
});
