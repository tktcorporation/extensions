import { defineConfig } from "eslint/config";
import raycastConfig from "@raycast/eslint-config";

export default defineConfig([
  ...raycastConfig,
  {
    ignores: ["**/*.test.ts", "**/*.test.tsx"],
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      // TypeScript strict rules
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-non-null-assertion": "error",

      // Complexity rules - enforce maintainable code
      complexity: ["warn", 15],
      "max-depth": ["warn", 4],
      "max-lines": ["warn", { max: 500, skipBlankLines: true, skipComments: true }],
      "max-lines-per-function": ["warn", { max: 150, skipBlankLines: true, skipComments: true }],
      "max-params": ["warn", 5],
      "max-statements": ["warn", 30],

      // Code quality rules
      "no-duplicate-imports": "error",
      "no-unused-expressions": "error",
      "prefer-const": "error",
      "no-var": "error",
      eqeqeq: ["error", "always"],
      curly: ["error", "all"],
      "no-throw-literal": "error",
      "prefer-promise-reject-errors": "error",

      // Best practices
      "no-async-promise-executor": "error",
      "no-await-in-loop": "warn",
      "require-await": "warn",
    },
  },
]);
