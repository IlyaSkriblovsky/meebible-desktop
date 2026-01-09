import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import { Button, ButtonGroup } from "@mui/material";
import { useHotkeys } from "react-hotkeys-hook";

import { useLocationContext } from "../contexts/LocationContext.tsx";

export function PrevNextButtons() {
  const { hasPrevChapter, hasNextChapter, goPrevChapter, goNextChapter } = useLocationContext();

  useHotkeys("left", goPrevChapter, [goPrevChapter]);
  useHotkeys("right", goNextChapter, [goNextChapter]);

  return (
    <ButtonGroup>
      <Button disabled={!hasPrevChapter} onClick={goPrevChapter}>
        <KeyboardArrowLeft />
      </Button>
      <Button disabled={!hasNextChapter} onClick={goNextChapter}>
        <KeyboardArrowRight />
      </Button>
    </ButtonGroup>
  );
}
