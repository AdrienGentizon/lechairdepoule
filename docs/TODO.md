# Todo

## Auth

- [ ] Make "Renvoyer un code" more visible after expired / too many attempts
- [ ] Handle session without matching forum user (`getAuthenticatedUser`)
- [ ] Cleanup Clerk left-overs

## Events

- [ ] Tell user when cover upload fails on event creation (`insertEventAction`)
- [ ] Clean up orphan blobs on deletion failure (`deleteImage`)

## Rate limiting — later pass

- [ ] Rate limit OTP sends, contact form, conversations, messages (DIY or Arcjet)

## CMS — after www go-live

- [ ] Surface OTP email send failures (same as www)
- [ ] Obfuscate emails in `sendOTPToEmail` traces
