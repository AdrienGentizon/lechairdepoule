# Todo

## Before pushing to prod

- [ ] Back up prod DB (`db/backup.sh`)
- [ ] Apply `db/updates/21-create-better-auth-schema.sql` (idempotent)
- [ ] Set `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET` on Vercel prod (www)

## Clerk — after prod cutover

- [ ] Remove Clerk env vars
- [ ] Disable the Clerk app and its webhook
- [ ] Once all users are migrated, drop the `"clerk"` provider from `selectUserFromAuthId` / `selectUserFromEmail` types

## Auth

- [x] Surface OTP email send failures (`email_not_sent`)
- [x] Revoke session when forum user upsert fails
- [x] Distinguish `/api/me` errors from logged out (`useMe`)
- [x] Surface sign-out failure, do not navigate on error
- [x] Reword expired / too many attempts messages (ask for a new code)
- [ ] Make "Renvoyer un code" more visible after expired / too many attempts
- [ ] Handle session without matching forum user (`getAuthenticatedUser`)

## Events

- [ ] Tell user when cover upload fails on event creation (`insertEventAction`)
- [ ] Clean up orphan blobs on deletion failure (`deleteImage`)

## Trace

- [ ] Replace `www/lib/trace.ts`, `www/lib/string.ts` with `@cdp/lib`
- [ ] Replace `getLogger` / `getRequestLogger` with `Trace`

## Rate limiting — later pass

- [ ] Rate limit OTP sends, contact form, conversations, messages (DIY or Arcjet)

## CMS — after www go-live

- [ ] Surface OTP email send failures (same as www)
- [ ] Obfuscate emails in `sendOTPToEmail` traces
