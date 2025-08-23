import perfectionist from "eslint-plugin-perfectionist";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  {
    files: ["**/*.{js,jsx,cjs,mjs}"],
    languageOptions: { ecmaVersion: "latest", sourceType: "module" },
    rules: {
      semi: "error",
      "prefer-const": "error",
    },
  },
  ...tseslint.configs.recommended,
  {
    ignores: ["dist/", "src-tauri/", "tsconfig.json"],
  },
  {
    plugins: {
      perfectionist,
    },
    rules: {
      "perfectionist/sort-imports": ["error", { type: "natural" }],
      "perfectionist/sort-named-imports": ["error", { type: "natural" }],
      "perfectionist/sort-jsx-props": ["error", { type: "natural" }],
    },
  },
]);
