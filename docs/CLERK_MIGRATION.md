# Clerk → better-auth migration

## Existing users

On successful OTP sign-in, `www/actions/auth/signInWithOTP.ts` migrates them: `public.users` is upserted on `email` and switched from `auth_provider='clerk'` to `better-auth`. Pseudo, role and content are kept.

## Leftover Clerk sessions

No special handling. Clerk cookies (`__session`, `__client_uat`) are ignored by better-auth, so former Clerk users simply appear logged out and any forum action opens the sign-in dialog. The sign-in flow is the same email OTP they used with Clerk.

## After prod cutover

- Remove Clerk env vars and disable the Clerk app and its webhook.
- Once all users are migrated, drop the `"clerk"` provider from the `selectUserFromAuthId` / `selectUserFromEmail` types.
