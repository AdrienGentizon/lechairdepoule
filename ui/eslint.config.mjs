import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig } from "eslint/config";

import baseConfig from "../eslint.config.base.mjs";

export default defineConfig([
  ...baseConfig,
  reactHooks.configs.flat.recommended,
]);
