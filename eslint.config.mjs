import js from "@eslint/js";
import globals from "globals";
import astro from "eslint-plugin-astro";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: ["dist/**", ".astro/**", ".emdash/**", "emdash-env.d.ts", "src/cloudflare-env.d.ts"]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs["flat/recommended"],
  ...astro.configs["flat/jsx-a11y-recommended"],
  {
    files: ["**/*.{js,mjs,ts,astro}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        __WOODHOUSE_READ_ONLY__: "readonly"
      }
    }
  }
];
