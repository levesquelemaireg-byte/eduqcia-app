import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Scripts Node CommonJS (require) — hors règles TypeScript ESM
    "scripts/**/*.cjs",
    // Fichier généré par `npm run gen:types` — pas de lint
    "lib/types/database.ts",
    // Artefacts build maquette — pas de lint
    "maquette/**",
  ]),
  {
    files: ["**/*.{js,jsx,ts,tsx,mjs,cjs}"],
    ignores: ["scripts/**"],
    rules: {
      // Aligné `docs/DECISIONS.md` / `docs/BACKLOG.md` — pas de console.log oublié en livré
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    ignores: ["scripts/**"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: ["scripts/**/*.ts"],
    rules: {
      "no-console": "off",
    },
  },
  // Désactive les règles ESLint en conflit avec Prettier — doit rester en dernier
  eslintConfigPrettier,
]);

export default eslintConfig;
