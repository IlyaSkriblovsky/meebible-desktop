import { Box } from "@mui/material";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { useBookmarksContext } from "../contexts/BookmarksContext.tsx";
import { useChapterTextContext } from "../contexts/ChapterTextContext.tsx";
import { useLocationContext } from "../contexts/LocationContext.tsx";
import { SelectedVersesToolbar, ToolbarPosition } from "./SelectedVersesToolbar.tsx";

function useBookmarksLogic(selectedVerses: number[]) {
  const { bookmarkedVerses, addVersesToBookmarks, removeVersesFromBookmarks } = useBookmarksContext();

  const allSelectedAreBookmarked = useMemo(
    () => selectedVerses.length > 0 && selectedVerses.every((verseId) => bookmarkedVerses.includes(verseId)),
    [bookmarkedVerses, selectedVerses],
  );

  const toggleBookmarkForSelectedVerses = useCallback(() => {
    if (allSelectedAreBookmarked) {
      removeVersesFromBookmarks(selectedVerses).then();
    } else {
      addVersesToBookmarks(selectedVerses).then();
    }
  }, [addVersesToBookmarks, allSelectedAreBookmarked, selectedVerses]);

  return {
    bookmarkedVerses,
    allSelectedAreBookmarked,
    toggleBookmarkForSelectedVerses,
  };
}

export function ChapterContent() {
  const { location } = useLocationContext();
  const chapterText = useChapterTextContext();

  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);

  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);

  const { bookmarkedVerses, allSelectedAreBookmarked, toggleBookmarkForSelectedVerses } =
    useBookmarksLogic(selectedVerses);

  const [toolbarPosition, setToolbarPosition] = useState<ToolbarPosition>(null);
  const [toolbarHeight, setToolbarHeight] = useState(0);

  const getVerseId = useCallback((verseElement: Element | null): number | null => {
    if (!verseElement) return null;
    const str = verseElement.getAttribute("verse") ?? verseElement.id ?? null;
    if (str === null) return null;
    const num = Number(str);
    return Number.isNaN(num) ? null : num;
  }, []);

  const findVerseElement = useCallback((container: HTMLElement, verseId: string) => {
    const safeVerseId = CSS.escape?.(verseId) ?? verseId;
    const selector = `.verse[verse="${safeVerseId}"]`;
    return container.querySelector<HTMLElement>(selector);
  }, []);

  const selectedVerseElements = useCallback(() => {
    if (!container) return [];
    return selectedVerses
      .map((verseId) => findVerseElement(container, verseId.toString()))
      .filter((verse): verse is HTMLElement => verse != null);
  }, [container, findVerseElement, selectedVerses]);

  const clearSelection = useCallback(() => setSelectedVerses([]), []);

  useEffect(() => {
    clearSelection();
  }, [clearSelection, location.bookCode, location.chapterNo]);

  // Verse click handler
  useEffect(() => {
    if (!container) return;

    const handleVerseClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const verseElement = target.closest(".verse");
      if (!verseElement || !container.contains(verseElement)) return;

      const verseId = getVerseId(verseElement);
      if (!verseId) return;

      setSelectedVerses((prevSelected) => {
        const alreadySelected = prevSelected.includes(verseId);
        const updated = alreadySelected ? prevSelected.filter((id) => id !== verseId) : [...prevSelected, verseId];
        return updated.sort();
      });
    };

    container.addEventListener("click", handleVerseClick);
    return () => container.removeEventListener("click", handleVerseClick);
  }, [container, getVerseId, chapterText.loaded]);

  const html = useMemo(() => ({ __html: chapterText.loaded ? chapterText.text : "" }), [chapterText]);

  // Set css classes on verses
  useEffect(() => {
    if (!container) return;

    const verseElements = Array.from(container.querySelectorAll<HTMLElement>(".verse"));

    verseElements.forEach((verseElement) => {
      const verseId = getVerseId(verseElement);
      const isSelected = verseId != null && selectedVerses.includes(verseId);
      const isBookmarked = verseId != null && bookmarkedVerses.includes(verseId);

      verseElement.classList.toggle("selected", isSelected);
      verseElement.classList.toggle("bookmarked", isBookmarked);
    });
  }, [container, selectedVerses, bookmarkedVerses, getVerseId, html]);

  const updateToolbarPosition = useCallback(() => {
    if (!container || selectedVerses.length === 0) {
      setToolbarPosition(null);
      return;
    }

    const scrollTop = container.parentElement?.scrollTop ?? 0;
    const containerRect = container.getBoundingClientRect();
    const verseRects = selectedVerseElements()
      .map((verseElement) => verseElement.getBoundingClientRect())
      .filter((rect): rect is DOMRect => rect != null);

    if (verseRects.length === 0) {
      setToolbarPosition(null);
      return;
    }

    const minTop = Math.min(...verseRects.map((rect) => rect.top));
    const minLeft = Math.min(...verseRects.map((rect) => rect.left));
    const maxRight = Math.max(...verseRects.map((rect) => rect.right));
    const maxBottom = Math.max(...verseRects.map((rect) => rect.bottom));

    const centerX = (minLeft + maxRight) / 2 - containerRect.left;
    const gap = 12;
    const aboveTop = minTop - containerRect.top - scrollTop - gap - toolbarHeight;
    const placement = aboveTop >= 0 ? "above" : "below";
    const top = placement === "above" ? minTop - containerRect.top - gap : maxBottom - containerRect.top + gap;

    setToolbarPosition({ left: centerX, top, placement });
  }, [container, selectedVerseElements, selectedVerses, toolbarHeight]);

  useEffect(() => updateToolbarPosition(), [updateToolbarPosition]);

  // Calculate and fill toolbarHeight
  useLayoutEffect(() => {
    if (!toolbarRef.current) return;
    const rect = toolbarRef.current.getBoundingClientRect();
    if (rect.height !== toolbarHeight) {
      setToolbarHeight(rect.height);
    }
  }, [selectedVerses.length, toolbarPosition]);

  // Reposition toolbar on window resize
  useEffect(() => {
    window.addEventListener("resize", updateToolbarPosition);
    return () => window.removeEventListener("resize", updateToolbarPosition);
  }, [updateToolbarPosition]);

  // Outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;

      if (toolbarRef.current?.contains(target)) return;

      if (container?.contains(target)) {
        const verseElement = (target as HTMLElement).closest(".par");
        if (!verseElement && selectedVerses.length > 0) {
          clearSelection();
        }
        return;
      }

      if (selectedVerses.length > 0) clearSelection();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && selectedVerses.length > 0) {
        clearSelection();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [container, clearSelection, selectedVerses.length]);

  // Toolbar actions

  const onCopy = useCallback(async () => {
    const verses = selectedVerseElements();
    if (verses.length === 0) return;

    const text = verses
      .map((verse) => {
        const verseText = verse.innerText.trim();
        const label = verse.querySelector(".verse-label")?.textContent?.trim() ?? "";
        if (!label) return verseText;
        return verseText.startsWith(label)
          ? `${label} ${verseText.slice(label.length).trimStart()}`
          : `${label} ${verseText}`;
      })
      .join("\n");

    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error("Failed to copy verses", error);
    } finally {
      clearSelection();
    }
  }, [clearSelection, selectedVerseElements]);

  const onBookmark = useCallback(() => {
    toggleBookmarkForSelectedVerses();
    clearSelection();
  }, [toggleBookmarkForSelectedVerses, clearSelection]);

  if (!chapterText.loaded) return null;

  return (
    <Box ref={setContainer} sx={{ px: 3, pb: 3, pt: 1, position: "relative" }}>
      <Box className="bible-text" dangerouslySetInnerHTML={html} />
      <SelectedVersesToolbar
        bookmarkAction={allSelectedAreBookmarked ? "remove" : "add"}
        onBookmark={onBookmark}
        onCopy={onCopy}
        position={toolbarPosition}
        ref={toolbarRef}
      />
    </Box>
  );
}
