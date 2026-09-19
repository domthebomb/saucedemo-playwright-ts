// @ts-check
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import playwright from "eslint-plugin-playwright";
import eslintConfigPrettier from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**", "playwright-report/**", "test-results/**"],
  },
  eslint.configs.recommended,
  {
    // Type-aware rules need a tsconfig that actually covers the linted files,
    // so they're scoped to what tsconfig.json includes rather than applied
    // repo-wide (this config file itself isn't part of that tsconfig).
    files: ["tests/**/*.ts", "playwright.config.ts"],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ["tests/**/*.spec.ts"],
    ...playwright.configs["flat/recommended"],
  },
  eslintConfigPrettier,
);
