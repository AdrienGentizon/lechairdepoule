# Clerk → better-auth migration

## Sign out Clerk users

Users still holding a Clerk session (`__session`, `__client_uat` cookies) must be signed out so they go through the new OTP sign-in flow.

On successful OTP sign-in, `actions/auth/signInWithOTP.ts` migrates them: `public.users` is upserted on `email` and switched from `auth_provider='clerk'` to `better-auth`. Pseudo, role and content are kept.

### TODO

- Detect a Clerk session without a better-auth session.
- Clear the Clerk cookies.
- Tell the user why: "Nous avons changé de système de connexion, reconnectez-vous avec votre email."
