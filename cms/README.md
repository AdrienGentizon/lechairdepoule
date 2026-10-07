# cms

Back office for [www](../www) contributors.

`www` is the public-facing app. Everything that edits or moderates its content is moving here, in a dedicated app with its own URL.

> **Work in progress** — admin features still live in www and are being migrated one by one.

## Users

- **Admins** — manage www as a whole
- **Venue managers** — manage their venues and events
- **Forum moderators** (planned) — moderate forum content

## Stack

- [Next.js](https://nextjs.org) (App Router)
- [better-auth](https://www.better-auth.com) — email OTP sign-in
- [Kysely](https://kysely.dev) + Postgres — shares the database with www
- [`@cdp/ui`](../ui) — shared UI components

## Development

```bash
cp .env.example .env.local
pnpm dev
```

Runs on [http://localhost:3001](http://localhost:3001) so it can run alongside www (port 3000).

## Scripts

| Script           | Description                        |
| ---------------- | ---------------------------------- |
| `pnpm dev`       | Start the dev server on port 3001  |
| `pnpm build`     | Production build                   |
| `pnpm start`     | Serve the production build         |
| `pnpm lint`      | Lint with ESLint                   |
| `pnpm typecheck` | Generate route types and run `tsc` |
| `pnpm format`    | Format with Prettier               |
