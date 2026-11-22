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
  overrides: [
    {
      files: "www/**",
      options: { tailwindStylesheet: "./www/app/globals.css" },
    },
    {
      files: "cms/**",
      options: { tailwindStylesheet: "./cms/app/globals.css" },
    },
  ],
};

export default config;
