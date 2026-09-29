# Architecture

## Product model

- **Identity rooms** — company batch (company + office + joining month, or "date awaited"),
  hometown→city. System-created, auto-joined. For belonging and information.
- **Place rooms** — areas and tech parks. System-created, auto-joined from the areas a user
  is considering and their office's tech park. Open to everyone regardless of company.
- **City room** — a thin, relevance-ranked "Bengaluru newcomers" feed.
- **Groups** — user-created, always inside a canonical room, incubate until ~5 members
  (≥2 verified). *Post-validation; schema supports it, UI deferred.*
- **Asks** — structured needs (`flatmate`, `pg`, `room_available`, `commute`, `travel`,
  `weekend`, `furniture`). Shown in every relevant place room, matched instantly for the
  creator, surfaced to matching people.
- **People discovery** — "people matching your needs" on home + per-area directory filtered
  by move-in month and intent tags.
- **Intros** — every person-to-person connection uses one mutual-accept flow. Contact
  handles are revealed only after both accept.

## Modules

| Module | Owns |
|--------|------|
| Onboarding | profile, areas, intents, `assign_rooms()` |
| Rooms & feed | room pages (Discussion / Questions / Asks tabs), city feed, home |
| Asks & matching | asks CRUD + expiry, `match_asks()`, `match_people()`, directory, intros |
| Information | joining reports, `cohort_stats`, `area_stats`, public pages |
| Trust & admin | verification, reports, blocks, moderation, scam filter, rate limits, `/admin` |

## Data model

```
-- reference (seeded; new entries admin-approved)
cities(id, name, slug)
areas(id, city_id, name, slug, lat, lng)
tech_parks(id, city_id, area_id, name, slug)
companies(id, name, slug, status)
offices(id, company_id, city_id, area_id, tech_park_id, name, slug, status)

-- users
profiles(user_id PK → auth.users, display_name, gender, hometown, city_id,
         reason['job'|'college'|'relocation'], company_id, office_id,
         joining_date, joining_status['known'|'awaited'], arrival_date,
         budget_min, budget_max, verified bool, role['user'|'admin'],
         stage['preparing'|'settled'], created_at, updated_at)
profile_areas(user_id, area_id)                     PK(user_id, area_id)
profile_intents(user_id, intent)                    PK(user_id, intent)
contact_handles(user_id PK, whatsapp, telegram)     -- RLS: owner, or accepted intro

-- communities
rooms(id, kind['identity'|'place'|'city'|'group'], key UNIQUE, parent_id NULL,
      title, city_id, women_only bool,
      status['incubating'|'listed'|'hidden'|'archived'], created_by NULL,
      member_count int, last_activity_at)
room_memberships(room_id, user_id, role['member'|'mod'], joined_at)  PK(room_id, user_id)
posts(id, room_id, author_id, kind['discussion'|'question'], body,
      status['published'|'held'|'removed'], answered bool, created_at)
replies(id, post_id, author_id, body, status, created_at)

-- needs & connections
asks(id, user_id, type, city_id, area_ids int[], date_from, date_to,
     budget_min, budget_max, gender_pref['any'|'women'|'men'], verified_only bool,
     tags jsonb, body, status['open'|'closed'|'expired'], expires_at, created_at)
intro_requests(id, from_id, to_id, ask_id NULL, message,
               status['pending'|'accepted'|'declined'|'expired'], created_at, responded_at)
               UNIQUE(from_id, to_id) WHERE status = 'pending'

-- information
joining_reports(id, user_id, company_id, office_id, batch_label, received_on,
                joining_date, source, weight, created_at)  UNIQUE NULLS NOT DISTINCT(user_id, company_id, office_id)
cohort_stats(company_id, office_id, month, reported, joining, seeking_flatmates, updated_at)
area_stats(area_id, newcomers_by_month jsonb, open_asks_by_type jsonb, updated_at)

-- trust & plumbing
verification_requests(id, user_id, type['college_email'|'offer_letter'], file_path, status, decided_at)
reports(id, reporter_id, target_type, target_id, reason, status, created_at)
blocks(blocker_id, blocked_id)                      PK(blocker_id, blocked_id)
events(id, user_id, type, payload jsonb, created_at, sent_at)
fake_door_optins(user_id, area_id, office_id, created_at)
```

Indexes: `room_memberships(user_id)`, `posts(room_id, created_at desc)`,
`asks(city_id, type, status, date_from)`, GIN on `asks.area_ids`,
`joining_reports(company_id, office_id, joining_date)`, `intro_requests(to_id, status)`.

## Key functions

- `assign_rooms(user_id)` — derives room keys from the profile
  (`identity:company:<company>:<office>:<yyyy-mm|awaited>`, `identity:hometown:<hometown>:<city>`,
  `place:area:<area>`, `place:techpark:<park>`, `city:<city>`), upserts rooms, syncs memberships
  (adds new, removes stale system memberships), updates `member_count`. Idempotent.
- `match_asks(ask_id)` — hard filters (same city, area overlap, mutual gender pref, budget
  and date overlap, verified_only, no blocks either way, not self), then score:
  0.4 area overlap + 0.3 budget overlap + 0.2 date closeness + 0.1 shared attributes.
- `match_people(user_id)` — same idea using profile areas, intents, arrival month.

## Flows

1. **Arrival → connection**: public page (ISR) → "Find your batch" → Google/email link →
   onboarding → `assign_rooms` → home shows matches → Connect → intro accepted → handles revealed.
2. **Ask created**: validate + moderate → insert → `match_asks` shown immediately →
   `events` for matched users → `area_stats` refresh.
3. **Joining report**: insert → `cohort_stats` refresh → events for cohort members awaiting dates.

## Background jobs

Pure-SQL jobs run in Supabase `pg_cron` (free, host-independent):
- refresh `cohort_stats`, `area_stats` (every 15 min)
- expire asks and intro requests (hourly)
- preparing → settled after arrival date (daily)

Jobs that need the app (email, Storage API) run from Vercel Cron → `/api/cron/*`, secret-protected.
Hobby cron runs at most once a day:
- email digest from unsent `events` (daily); intro-accepted emails are sent immediately from the action
- delete any verification file older than 7 days as a safety net (daily)

## Scale path (only after the validation gate says Scale)

Supabase Pro + Vercel Pro (Vercel Hobby is non-commercial only, so partner listings or any revenue
need Pro or another host such as Cloudflare Workers via OpenNext) → buy a domain → web push + WhatsApp digests → groups UI → area guide
(rent/commute reports + cached Maps) → next companies/cities → partner listings (revenue)
→ Meilisearch only if Postgres search is slow → marketplace, meetups, travel-together.
