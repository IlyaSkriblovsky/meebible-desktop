import React from "react";
import ReactDOM from "react-dom/client";

import { App } from "./components/App.tsx";
import "./mediaquerylist-polyfill.js";
import { AppRuntime, appRuntime } from "./utils.ts";

console.group(`MeeBible Desktop`);
console.log("Bundle Version:", __BUNDLE_VERSION__);
console.log("App Runtime", appRuntime);
if (appRuntime == AppRuntime.TAURI) {
  console.log("Tauri Target Triple", __TAURI_TARGET_TRIPLE__);
  console.log("Tauri Platform Version", __TAURI_PLATFORM_VERSION__);
}
console.log("import.meta.env", import.meta.env);
console.groupEnd();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
