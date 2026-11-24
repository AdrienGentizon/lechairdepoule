import nextVitals from "eslint-config-next/core-web-vitals";
import { defineConfig } from "eslint/config";

import baseConfig from "../eslint.config.base.mjs";

export default defineConfig([baseConfig, nextVitals]);
