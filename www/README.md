# www

Public-facing website of Le Chair de Poule.

Admin and content management are moving to [cms](../cms), a dedicated app with its own URL, so that `www` only serves public visitors and forum users. Until the migration is done, admin features still live here.

## Sections

- **Website** — `app/(website)`
- **Forum** — `app/(forum)`, see [moderation](docs/moderation.md)

## Stack

- [Next.js](https://nextjs.org) (App Router)
- [Clerk](https://clerk.com) — auth, migrating to [better-auth](https://www.better-auth.com) like cms for less aggressive session expiration
- [Contentful](https://www.contentful.com) — editorial content
- Postgres (Neon) — shares the database with cms
- [Pusher](https://pusher.com) — realtime
- [Resend](https://resend.com) — emails
- [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) — image storage
- [Sentry](https://sentry.io) — error monitoring
- [`@cdp/ui`](../ui) — shared UI components

## Development

```bash
cp .env.example .env.local
pnpm dev
```

Runs on [http://localhost:3000](http://localhost:3000) so it can run alongside cms (port 3001).

## Scripts

| Script            | Description                                       |
| ----------------- | ------------------------------------------------- |
| `pnpm dev`        | Start the dev server on port 3000                 |
| `pnpm build`      | Production build                                  |
| `pnpm start`      | Serve the production build                        |
| `pnpm lint`       | Lint with ESLint                                  |
| `pnpm typecheck`  | Generate route types and run `tsc`                |
| `pnpm format`     | Format with Prettier                              |
| `pnpm db:dump`    | Dump the database to `../backup.dump`             |
| `pnpm db:restore` | Restore `../backup.dump` into the target database |
