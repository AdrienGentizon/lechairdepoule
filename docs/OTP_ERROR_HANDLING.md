# OTP sign-in error handling — plan

Goal: a user can never end up stuck (logged out with no working way back in) or confused about their auth state. Every failure in the sign-in / sign-out flow must be visible, explained, and recoverable.

See [SILENT_ERRORS.md](./SILENT_ERRORS.md) for the current inventory.

## Stuck / confusing scenarios

### 1. Code never arrives, form says it was sent

- **Cause:** better-auth runs `sendVerificationOTP` through `runInBackgroundOrAwait`, which swallows errors (Resend quota, Resend outage, `MAILING_SERVICE_STATUS=disabled`).
- **Effect:** user waits for an email that will never come, retries, still nothing.
- **Fix:** send the email ourselves so the action sees the failure.
  - In `www/actions/auth/sendOTPToEmail.ts`: generate the code with `auth.api.createVerificationOTP({ body: { email, type: "sign-in" } })` (server-only endpoint of the emailOTP plugin, exists in better-auth 1.7.27), then call `sendEmail` + `OTPEmail` directly.
  - `emailOTP.sendVerificationOTP` becomes unused for sign-in (throw to catch accidental use).
  - Return a dedicated error key (e.g. `email_not_sent`) and stay on the email step with a clear message: "Impossible d'envoyer le code pour le moment, réessayez plus tard."
  - In production, treat `MAILING_SERVICE_STATUS=disabled` as an error, not a silent skip.

### 2. User signs out while sign-in is broken

- **Cause:** sign-out always works, sign-in may not (scenario 1, quota exhausted).
- **Effect:** user voluntarily locks themselves out until the mail service recovers.
- **Options (to decide):**
  - Accept it once scenario 1 is visible: the user at least knows why and when to retry.
  - Or warn in the sign-out confirmation that a new code by email will be needed to sign back in.
- With 14-day sliding sessions, users rarely need to sign in, which limits exposure.

### 3. Signed in server-side, logged out in the UI

- **Cause A:** `signInWithOTP` creates the better-auth session (cookie set) **before** upserting `public.users`. If the upsert fails, it returns `upsert_user_failed` but the session stays. `getAuthenticatedUser` then finds no forum user → app shows logged out.
- **Fix A:** on upsert failure, revoke the session (`auth.api.signOut`) before returning the error, so state stays consistent: either fully signed in or fully signed out.
- **Cause B:** `useMe` returns `null` on any non-OK `/api/me` (500, network) → server error looks like logged out, user tries to sign in again.
- **Fix B:** `useMe` distinguishes 401 (logged out) from other failures (error state, keep previous `me`, retry). Header shows an error/retry state instead of the sign-in button.

### 4. User signs out but is still signed in

- **Cause:** `signOut` action swallows errors; `SignOutButton` always resets `me` and navigates.
- **Fix:** action returns a `Result`; on failure, show a message and do not navigate.

### 5. Code expired / too many attempts

- **Current:** OTP valid 5 min, 3 attempts (better-auth default `allowedAttempts`), then `OTP_EXPIRED` / `TOO_MANY_ATTEMPTS`.
- **Check:** the message tells the user to request a new code, and the "Renvoyer un code" button is obvious in that state (maybe auto-switch to a "send a new code" CTA).
- **Check:** better-auth rate limit on send (3 / 60 s) — verify whether it applies to server-side `auth.api` calls; if it does, surface it as its own message ("patientez une minute").

### 6. Former Clerk user loses their account (email case)

- **Cause:** actions lowercase the email; `signInWithOTP` upserts `ON CONFLICT (email)`. If `public.users.email` was stored with uppercase letters, there is no conflict → a **new** user row is created (no pseudo, no history) instead of migrating the existing one.
- **Fix:** before go-live, check `SELECT count(*) FROM users WHERE email <> lower(email);` and normalize existing rows (watch for duplicates). Compare emails with `lower(email)` in `selectUserFromEmail`.

## Shared trace in all packages

Use `@cdp/lib/trace` (`Trace`, `toObfuscatedUser`) and `@cdp/lib/string` everywhere:

- Delete `www/lib/trace.ts` and `www/lib/string.ts`; replace imports (`www/lib/auth/index.ts`, `www/actions/auth/sendOTPToEmail.ts`, …).
- Replace `getLogger` / `getRequestLogger` (`www/lib/logger.ts`, `www/lib/getRequestLogger.ts`, ~28 files) with `Trace` — `new Trace(req)` covers the request logger case.
- Delete `www/lib/logger.ts` and `www/lib/getRequestLogger.ts` once unused.
- cms already uses `@cdp/lib/trace`.

## Order

1. Scenario 6 check (data, before anyone signs in on prod).
2. Scenario 1 (critical, blocks go-live).
3. Scenarios 3A, 3B, 4.
4. Scenario 5 checks, scenario 2 decision.
5. Trace migration (mechanical, can be done alongside).
6. Update `SILENT_ERRORS.md` accordingly.
