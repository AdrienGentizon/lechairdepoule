# Postgres index candidates

Postgres does not index foreign keys automatically. `PRIMARY KEY` and `UNIQUE` columns are already indexed (`users.email`, `users.pseudo`, `users.auth_id`, `events.conversation_id`).

## Worth adding

- [] `messages(conversation_id)` — every conversation page (`selectConversationMessages`)
- [] `messages(parent_message_id)` — thread notifications (`upsertThreadNotifications`)

## With the CMS pivot

- [] `events(organization_id)` — organization page, agendas
- [] `events(venue_id)` — venue page, agendas
- [] `agenda_follows(agenda_id)` — when agendas land

## Not needed

- `created_by = ${userId}` filters — always combined with `id = ...`, PK already narrows it
- `events(start_date)` — `selectEvents` filters on `start_date` and `COALESCE(end_date, start_date)`, a plain index would serve the upper bound only; full scan is fine at current volume
- `deleted_at IS NULL`, `reported_at IS NULL`, `banned_at` — low selectivity / small tables
