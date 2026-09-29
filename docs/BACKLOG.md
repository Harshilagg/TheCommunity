# Backlog

1-week sprints (evenings + weekends). Current sprint is marked **▶**.
Stories use: *As a … I want … so that …*, then acceptance criteria (AC) and analytics events (EV).
Tick `[x]` when the Definition of Done in CLAUDE.md is met.

---

## ▶ Sprint 0 — Foundations

Goal: an empty but deployed, instrumented app with a local dev loop.

- [x] **S0-1 Project scaffold** — Next.js App Router + TS strict + Tailwind + shadcn/ui + pnpm scripts from CLAUDE.md.
  AC: `pnpm dev`, `lint`, `typecheck`, `test` all run; `.env.example` lists every env var.
- [ ] **S0-2 Supabase + Drizzle** — local Supabase via CLI, Drizzle config, first empty migration, `src/lib/supabase/{server,client,admin}.ts` using `@supabase/ssr`.
  AC: migration applies locally; server client reads session from cookies.
- [ ] **S0-3 CI** — GitHub Actions: install, lint, typecheck, unit tests on PR.
- [ ] **S0-4 Deploy** — Vercel (Hobby) project linked, preview + production envs, free `*.vercel.app` subdomain (no paid domain or DNS yet).
  AC: production URL serves the placeholder home page.
- [ ] **S0-4b Design tokens** — implement `docs/DESIGN.md`: fonts via `next/font/google` (Bodoni Moda + Jost), Tailwind colour tokens, paper grain, `<GrainHeadline>`, base button and row-list components.
  AC: placeholder home page shows `<GrainHeadline>` (serif-italic first letters + Jost 900, solid ink) on the grained paper background.
- [ ] **S0-5 Observability** — PostHog (typed `track()` wrapper in `src/lib/analytics`) and Sentry with PII scrubbing.
  AC: a test event appears in PostHog; a thrown test error appears in Sentry without user PII.
- [ ] **S0-6 Validation targets** — review `docs/VALIDATION.md` targets with the owner and freeze them. *(owner task)*
- [ ] **S0-7 Non-code setup** *(owner task)* — Google OAuth client; Resend account (free tier) for Supabase auth emails; draft privacy policy + terms.

## Sprint 1 — Schema, seed, public skeleton

Goal: the full data model with RLS, Bengaluru seeded, and indexable public pages live early (SEO takes weeks).

- [ ] **S1-1 Reference schema + seed** — cities, areas, tech_parks, companies, offices; seed Bengaluru (~50 areas, main tech parks) and these offices, each linked to its area and tech park
  (verify names and areas before writing the seed): Infosys — Electronic City; TCS — Whitefield, Electronic City;
  Wipro — Sarjapur Road, Electronic City; Accenture — Manyata Tech Park, Whitefield.
  AC: `pnpm db:seed` is idempotent; public read-only RLS on reference tables. Accenture has no public pages
  until Infosys/TCS/Wipro have activity (`companies.status`).
- [ ] **S1-2 Core schema + RLS** — all tables in ARCHITECTURE.md (groups UI not needed, but `rooms.parent_id/status` exist).
  AC: RLS on every table; tests prove: users can't read others' contact_handles; can't edit others' posts/asks; blocked users are hidden.
- [ ] **S1-3 Public page templates** — `/bengaluru`, `/bengaluru/companies/[company]/joining-dates`, `/bengaluru/areas/[area]`, `/bengaluru/tech-parks/[park]`.
  AC: server-rendered with ISR; title/meta/canonical/JSON-LD; intentional empty state ("Be the first from X to report"); "Find your batch" CTA with company/office prefilled.
  EV: `public_page_viewed`, `cta_find_batch_clicked`.
- [ ] **S1-4 Sitemap + robots** — generated from seed data. *(Owner: submit to Google Search Console.)*

## Sprint 2 — Auth, onboarding, rooms

Goal: a newcomer can sign up and land in the right rooms.

- [ ] **S2-1 Auth** — Google login + email magic link (Supabase Auth, SMTP via Resend free tier); login/callback pages; protected `(app)` layout.
  EV: `signup_completed`.
- [ ] **S2-2 Onboarding** — steps: reason + city → company/office/joining date (or "awaited") → arrival date + hometown → areas considering (multi-select) → budget + "open to" intents. Progress saved per step; only city + reason required.
  AC: completes in < 1 minute on mobile; editable later in settings.
  EV: `onboarding_step_completed`, `onboarding_completed`.
- [ ] **S2-3 `assign_rooms()`** — Postgres function per ARCHITECTURE.md; called on onboarding completion and profile edit.
  AC: idempotent; tests cover awaited → known date move, area change, hometown change.
  EV: `rooms_assigned`.
- [ ] **S2-4 Room page** — Discussion / Questions / Asks tabs, member count, paginated feed, create post, reply, mark answered.
  AC: posts go through rate limit → scam-pattern filter → OpenAI moderation; flagged or uncertain → held; empty states.
  Builds the minimal `src/lib/safety/` and `src/lib/moderation.ts` that S5-3 extends.
  EV: `room_viewed`, `post_created`, `reply_created`.
- [ ] **S2-5 Home v1** — my rooms (member counts, recent activity) + city feed ranked by my areas/tech park/arrival month.

## Sprint 3 — Joining-date tracker

Goal: the traffic hook — live, crowdsourced data on public pages.

- [ ] **S3-1 Report joining date** — form in the company room + on home; one editable report per user per company/office; verified users weighted higher.
  EV: `joining_report_submitted`.
- [ ] **S3-2 Stats jobs** — `cohort_stats` + `area_stats` refresh via Supabase `pg_cron` (every 15 min, pure SQL).
- [ ] **S3-3 Public pages show live data** — written as a sentence or table rows, e.g. "312 people have reported. 48 join in October, and 12 of them are looking for flatmates." Recent (anonymised) reports timeline.
  AC: public pages read only aggregate tables; no names or handles.
- [ ] **S3-4 Cohort updates on home** — "Your batch: 3 new reports this week".

## Sprint 4 — Asks, matching, people, intros (core value)

Goal: two newcomers from different companies can find each other around a need and connect.

- [ ] **S4-1 Create/edit/close ask** — types from ARCHITECTURE.md; type-specific fields; expiry (default 30 days); women-only and verified-only options.
  EV: `ask_created`.
- [ ] **S4-2 `match_asks()`** — hard filters + score; creator sees matches immediately after posting.
  AC: tests cover gender pref both ways, blocks, budget/date overlap, self-exclusion.
  EV: `ask_matches_shown`.
- [ ] **S4-3 Asks in place rooms** — Asks tab lists open asks for that area/tech park with filters.
- [ ] **S4-4 People directory** — per area: newcomers by move-in month, filter by intents; rows show overlap with me as a sentence ("You're both moving in November and both from Jaipur").
  EV: `people_directory_viewed`.
- [ ] **S4-5 Intro flow** — request (optional message) → accept/decline → contact handles revealed; limits on pending requests per day.
  AC: RLS test proves handles unreadable before acceptance.
  EV: `intro_requested`, `intro_responded`, `contact_revealed`.
- [ ] **S4-6 Home v2** — "People matching your needs" at the top, then my asks + responses, rooms, feed.

## Sprint 5 — Trust, admin, revenue test, beta

Goal: safe enough to open to strangers; measurement ready.

- [ ] **S5-1 Report + block** on posts, replies, asks, profiles. Auto-hide after N reports from distinct verified users.
  EV: `report_submitted`.
- [ ] **S5-2 Verification** — college email or redacted offer letter upload (private bucket); admin approve/reject deletes the file in the same action.
  EV: `verification_submitted`, `verification_decided`.
- [ ] **S5-3 Scam-pattern filter** — block phone numbers/UPI IDs/links in asks and posts from unverified users; flag "deposit before viewing", "official", "HR", "fee" patterns; banner in company rooms: companies never charge joining fees.
- [ ] **S5-4 Admin** — `/admin` (role-gated): reports, held posts, verifications, new company/office suggestions.
- [ ] **S5-5 Fake door** — "Verified PGs & co-living near [office]" card for users with housing asks; opt-in with consent.
  EV: `fake_door_pg_clicked`, `fake_door_pg_opted_in`.
- [ ] **S5-7 Digest email** — daily digest from `events` via Resend; intro-accepted email immediately; unsubscribe link.
- [ ] **S5-8 Account deletion + data export** in settings.
- [ ] **S5-9 PostHog dashboards** from VALIDATION.md.
- [ ] **S5-10 Closed beta** *(owner task)* — 30–50 people from one company; fix top funnel drop-off.

## Sprint 6 — Launch + measure

- [ ] **S6-1 Launch** *(owner task)* — seed genuine reports/questions; share in fresher Telegram groups, Reddit, college networks for target companies only.
- [ ] **S6-2 Weekly review** — run `/sprint-review` each week; only fix bugs and the single weakest metric.
- [ ] **S6-3 Operator interviews** *(owner task)* — ~15 PG/co-living operators; log price they'd pay.
- [ ] **S6-4 Decision gate** — at end of 6-week window: Scale / Iterate / Stop, recorded below.

---

## Icebox (post-validation — do not build yet)

Groups UI with incubation + duplicate detection · area guide (rent/commute reports, Maps cache) ·
web push · WhatsApp notifications · invite-your-batchmates links · realtime feeds ·
travel together · meetups · marketplace · partner PG listings + payments · more cities ·
phone OTP login (Supabase Send SMS hook → MSG91, needs DLT registration).

## Sprint log

<!-- One line per completed story or decision: date — ID — note -->
2026-09-29 — decision — Zero-cost stack for validation: Vercel Hobby, Google + email magic link (no phone OTP), OpenAI free moderation, pg_cron for SQL jobs. Working name "Batchmate".
2026-09-29 — S0-1 — Next.js 16 + TS strict + Tailwind 4 + shadcn/ui (radix), Vitest + Playwright (mobile + desktop), site name in `src/config/site.ts`.
