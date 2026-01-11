import CheckIcon from "@mui/icons-material/Check";
import DownloadIcon from "@mui/icons-material/Download";
import { Button, Tooltip } from "@mui/material";

import { useTranslationDownloadingContext } from "../contexts/TranslationDownloadingContext.tsx";

export function TranslationDownloadButton() {
  const { isSupported, isDownloaded, isDownloading, start } = useTranslationDownloadingContext();

  const buttonTitle = isDownloaded
    ? "Current translation is downloaded and available offline"
    : "Download current translation";

  if (!isSupported) {
    return null;
  }

  return (
    <Tooltip title={buttonTitle}>
      <Button disabled={isDownloading} onClick={start}>
        {isDownloaded ? <CheckIcon /> : <DownloadIcon />}
      </Button>
    </Tooltip>
  );
}
