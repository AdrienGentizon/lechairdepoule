- [] move storage to r2
- [] move cdp contenful data (events) to cms

- [] create organizations table (venue, band, artist, booker...) which has many events
- [] create organization_members (venue_contributors...)
- [x] init event visibility considered all public pre feature
- [] create cdp venue organization, backfill events organization_id + venue_id, then organization_id NOT NULL
- [] sync chair_de_poule_db.sql with 23-init-cms.sql
- [] www displays its own venue events + events from organizations it subscribed to
- [] create user agendas (public or private) following organizations
