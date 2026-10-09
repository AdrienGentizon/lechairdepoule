# Silent errors

Failures that are swallowed, only logged, or look like success to the user. Kept here to decide later which ones deserve real handling.

> [!CAUTION]
> **CRITICAL — OTP email failure looks like success.** Not an edge case: if Resend's free tier caps at 100 emails/day, the post-Clerk migration (~246 users re-logging in) plus the contact form sharing the same quota will exhaust it. Every sign-in after that silently fails: the form says the code was sent, no email arrives, nothing tells the user or Sentry. Login gates every forum action.
>
> Before go-live:
>
> 1. Check Resend's real limits; upgrade during the migration and/or raise better-auth `session.expiresIn` to spread logins.
> 2. Report OTP send failures to Sentry (`captureException` in `sendSignInOTP`).
> 3. Later, if needed: surface the failure in the sign-in form (send outside better-auth's swallowing).

## Auth

### OTP email failure looks like success (CRITICAL)

- **Where:** `lib/auth/index.ts` (`sendSignInOTP`) called by better-auth `emailOTP`.
- **What:** better-auth runs `sendVerificationOTP` through `runInBackgroundOrAwait`, which catches any thrown error and only logs `Failed to run background task`.
- **Effect:** `actions/auth/sendOTPToEmail.ts` returns success, the form moves to the OTP step, no email ever arrives.
- **Visible in:** server logs (`sendSignInOTP` trace with status 500, then the better-auth log).

### `MAILING_SERVICE_STATUS=disabled` skips sign-in emails

- **Where:** `lib/mailing/sendEmail.ts`, `lib/auth/index.ts`.
- **What:** the `disabled` error is ignored on purpose for OTP emails.
- **Effect:** intended in development; if set in production, nobody can sign in and nothing tells them why.
- **Visible in:** nothing in production (the OTP is only traced in development).

### Session without a matching forum user

- **Where:** `lib/auth/getAuthenticatedUser.ts`, `actions/auth/signInWithOTP.ts`.
- **What:** a better-auth session exists but no `public.users` row matches `auth_provider='better-auth'` + `auth_id`.
- **When:** a `better-auth` row whose `auth_id` is stale (e.g. `auth_users` reset); `signInWithOTP` returns early for existing `better-auth` rows and never re-links them.
- **Effect:** sign-in succeeds, but the app treats the user as logged out (API routes answer unauthorized).
- **Visible in:** nothing specific.

### Sign out failure

- **Where:** `actions/auth/signOut.ts`, `components/Auth/SignOutButton.tsx`.
- **What:** the action catches and `console.error`s any error, the client always resets `me` and navigates to `/forum`.
- **Effect:** if the session was not revoked, `me` refetches and the user is still logged in, with no message.
- **Visible in:** server logs (`[auth/signOut]`).

### `/api/me` failure looks like logged out

- **Where:** `lib/auth/useMe.ts`.
- **What:** any non-OK response (401, 500, network) is `console.log`ged and returns `null`.
- **Effect:** a server error is indistinguishable from being logged out.
- **Visible in:** browser console only.

## Events

### Cover upload failure on event creation

- **Where:** `lib/events/insertEventAction.ts`.
- **What:** a failed cover upload is non-fatal, appended to the logger as `uploadError`.
- **Effect:** the event is created without its cover; the user is not told.
- **Visible in:** server logs (`insertEventAction`).

### Blob deletion failures

- **Where:** `lib/deleteImage.ts`, called by `deleteEventAction`, `deleteEventCoverAction`, `updateEventCoverAction`, `insertEventOrCleanupCover`, `updateEventCoverOrCleanup`.
- **What:** `deleteImage` never throws; failures are appended to the action logger (`deleteImageError`).
- **Effect:** orphan blobs stay in Vercel Blob storage; the action still reports success when the DB write succeeded.
- **Visible in:** server logs.
