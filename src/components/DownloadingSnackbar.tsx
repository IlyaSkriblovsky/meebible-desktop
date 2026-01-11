import DownloadIcon from "@mui/icons-material/Download";
import {
  Alert,
  Box,
  Grow,
  GrowProps,
  LinearProgress,
  LinearProgressProps,
  Snackbar,
  SnackbarOrigin,
  SnackbarSlots,
  Typography,
} from "@mui/material";

import { useTranslationDownloadingContext } from "../contexts/TranslationDownloadingContext.tsx";

function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box sx={{ width: "100%", mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography sx={{ color: "text.secondary" }} variant="body2">{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}

const anchorOrigin: SnackbarOrigin = { vertical: "bottom", horizontal: "right" };
const slots: Partial<SnackbarSlots> = {
  transition: (props: GrowProps) => <Grow {...props} />,
};

export function DownloadingSnackbar() {
  const { isSupported, isDownloading, isDownloadingDone, isCanceled, progress, cancel, clearDone } =
    useTranslationDownloadingContext();

  if (!isSupported) {
    return null;
  }

  return (
    <Snackbar anchorOrigin={anchorOrigin} open={isDownloading || isDownloadingDone} slots={slots}>
      {isDownloading || isCanceled ? (
        <Alert icon={<DownloadIcon />} onClose={cancel} severity="info" sx={{ width: "100%" }} variant="filled">
          Downloading translation for offline reading...
          <LinearProgressWithLabel color={"inherit"} value={Math.trunc(progress * 100)} />
        </Alert>
      ) : (
        <Alert onClose={clearDone} severity="success" variant="filled">
          <Typography>The translation has been downloaded successfully.</Typography>
          <Typography>Now you can read it offline.</Typography>
        </Alert>
      )}
    </Snackbar>
  );
}
