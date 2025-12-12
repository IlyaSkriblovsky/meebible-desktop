import { Box } from "@mui/material";
import { useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { ChapterTextContext } from "../contexts/ChapterTextContext.tsx";
import { LocationContext } from "../contexts/LocationContext.tsx";
import { SelectedVersesToolbar, ToolbarPosition } from "./SelectedVersesToolbar.tsx";

export function ChapterContent() {
  const { location } = useContext(LocationContext);
  const chapterText = useContext(ChapterTextContext);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);

  const [selectedVerses, setSelectedVerses] = useState<string[]>([]);
  const [highlightedVerses, setHighlightedVerses] = useState<Set<string>>(new Set());

  const [toolbarPosition, setToolbarPosition] = useState<ToolbarPosition>(null);
  const [toolbarHeight, setToolbarHeight] = useState(0);

  const getVerseId = useCallback((verseElement: Element | null) => {
    if (!verseElement) return null;
    return verseElement.getAttribute("verse") ?? verseElement.id ?? null;
  }, []);

  const findVerseElement = useCallback((container: HTMLElement, verseId: string) => {
    const safeVerseId = CSS.escape?.(verseId) ?? verseId;
    const selector = `.verse[verse="${safeVerseId}"]`;
    return container.querySelector<HTMLElement>(selector);
  }, []);

  const selectedVerseElements = useCallback(() => {
    const container = containerRef.current;
    if (!container) return [];
    return selectedVerses
      .map((verseId) => findVerseElement(container, verseId))
      .filter((verse): verse is HTMLElement => verse != null);
  }, [findVerseElement, selectedVerses]);

  const clearSelection = useCallback(() => {
    setSelectedVerses([]);
    setToolbarPosition(null);
  }, []);

  useEffect(() => {
    clearSelection();
    setHighlightedVerses(new Set());
  }, [clearSelection, location.bookCode, location.chapterNo]);

  // Verse click handler
  useEffect(() => {
    const container = containerRef.current;
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
        return updated.sort((a, b) => {
          const diff = Number(a) - Number(b);
          return Number.isNaN(diff) ? a.localeCompare(b) : diff;
        });
      });
    };

    container.addEventListener("click", handleVerseClick);
    return () => container.removeEventListener("click", handleVerseClick);
  }, [getVerseId, chapterText.loaded]);

  // Set css classes on verses
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const verseElements = Array.from(container.querySelectorAll<HTMLElement>(".verse"));

    verseElements.forEach((verseElement) => {
      const verseId = getVerseId(verseElement);
      const isSelected = verseId != null && selectedVerses.includes(verseId);
      const isHighlighted = verseId != null && highlightedVerses.has(verseId);

      verseElement.classList.toggle("selected", isSelected);
      verseElement.classList.toggle("highlighted", isHighlighted);
    });
  }, [selectedVerses, highlightedVerses, getVerseId]);

  const updateToolbarPosition = useCallback(() => {
    const container = containerRef.current;
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
  }, [selectedVerseElements, selectedVerses, toolbarHeight]);

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

      if (containerRef.current?.contains(target)) {
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
  }, [clearSelection, selectedVerses.length]);

  // Toolbar actions

  const copySelectedVerses = async () => {
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
  };

  const highlightSelectedVerses = () => {
    setHighlightedVerses((current) => {
      const next = new Set(current);
      const allHighlighted = selectedVerses.every((verseId) => next.has(verseId));

      if (allHighlighted) {
        selectedVerses.forEach((verseId) => next.delete(verseId));
      } else {
        selectedVerses.forEach((verseId) => next.add(verseId));
      }

      return next;
    });
    clearSelection();
  };

  const addBookmark = () => {
    if (selectedVerses.length === 0) return;

    // TODO: implement bookmarks

    clearSelection();
  };

  const html = useMemo(() => ({ __html: chapterText.loaded ? chapterText.text : "" }), [chapterText]);

  if (!chapterText.loaded) return null;

  return (
    <Box ref={containerRef} sx={{ px: 3, pb: 3, pt: 1, position: "relative" }}>
      <Box className="bible-text" dangerouslySetInnerHTML={html} />
      <SelectedVersesToolbar
        onBookmark={addBookmark}
        onCopy={copySelectedVerses}
        onHighlight={highlightSelectedVerses}
        position={toolbarPosition}
        ref={toolbarRef}
      />
    </Box>
  );
}
