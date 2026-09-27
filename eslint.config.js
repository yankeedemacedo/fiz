import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

const reactSettings = { react: { version: "18.3" } };

const reactPlugins = {
  react,
  "react-hooks": reactHooks,
  "react-refresh": reactRefresh,
};

const reactRules = {
  ...react.configs.recommended.rules,
  ...react.configs["jsx-runtime"].rules,
  ...reactHooks.configs.recommended.rules,
  "react/jsx-no-target-blank": "off",
  "react/prop-types": "off",
  "react-refresh/only-export-components": [
    "warn",
    { allowConstantExport: true },
  ],
};

export default tseslint.config(
  { ignores: ["dist", "coverage"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    settings: reactSettings,
    plugins: reactPlugins,
    rules: reactRules,
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    settings: reactSettings,
    plugins: reactPlugins,
    rules: reactRules,
  },
);
