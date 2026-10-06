const config = {
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  plugins: [
    "@trivago/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss",
  ],
  importOrder: ["^react", "^[a-zA-Z]", "^@cdp/(.*)$", "^@/(.*)$", "^[./]"],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  tailwindStylesheet: "./www/app/globals.css", // TODO merge/align a global one used by all packages
};

export default config;
