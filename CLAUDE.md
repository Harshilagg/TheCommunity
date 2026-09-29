# CLAUDE.md — Newcomer Platform

## What this project is

A community platform for people arriving somewhere new, starting with IT freshers joining
2–3 large recruiters in Bengaluru. It connects newcomers by **identity** (company batch,
hometown), **place** (area, tech park) and **need** (asks: flatmate, PG, commute buddy, etc.),
and gives crowdsourced answers (joining dates, rents) that AI and search can't.

**This build is a validation experiment, not a finished product.** The goal of the first
~6 sprints is to find out whether we can attract enough organic traffic and enough real
connections to justify revenue (partner PG / co-living listings) and further investment.
Read `docs/VALIDATION.md` before planning any work. Every decision should favour
*learning fast and cheaply* over completeness.

Other docs:
- `docs/ARCHITECTURE.md` — product model, modules, data model, flows
- `docs/BACKLOG.md` — sprints, user stories, acceptance criteria, status (source of truth for what to build)
- `docs/VALIDATION.md` — hypotheses, metrics, analytics events, decision gates
- `docs/DESIGN.md` — fonts, colours, background, component styling (follow it for every UI change)

## How we work (agile, solo developer)

- **1-week sprints.** Only build stories in the current sprint in `docs/BACKLOG.md`.
- **One story at a time.** For each story:
  1. Read the story and its acceptance criteria.
  2. Propose a short plan (files to touch, migrations, tests) and wait for approval
     unless told to proceed.
  3. Implement the smallest thing that meets the acceptance criteria.
  4. Add/adjust tests, run the checks below, fix failures.
  5. Emit the analytics events the story lists (see `docs/VALIDATION.md`).
  6. Tick the story in `docs/BACKLOG.md` and add a one-line note under "Sprint log".
- **Do not add features, abstractions or config that no current story needs.** If you
  think something is missing, add it to the "Icebox" section of the backlog instead of building it.
- Features planned for after validation (groups, area guide, WhatsApp, marketplace,
  realtime) go behind PostHog feature flags when they are eventually built.
- Prefer boring, well-documented solutions. No new dependency without saying why.

## Tech stack

- Next.js (latest stable, App Router) + TypeScript (`strict: true`), Tailwind, shadcn/ui
- Supabase (region: ap-south-1 / Mumbai): Postgres, Auth, Storage
- Drizzle ORM + drizzle-kit for schema and migrations
- Auth: Google OAuth first; phone OTP via Supabase Send SMS hook → MSG91 (added once DLT approval lands)
- Zod for all input validation
- Upstash Redis (`@upstash/ratelimit`) for rate limiting
- Resend for email (digests, intro accepted)
- PostHog (analytics + feature flags), Sentry (errors)
- Moderation: an LLM/moderation API behind `src/lib/moderation.ts` so the provider can be swapped
- Hosting: Vercel
- Tests: Vitest (unit + DB/RLS tests against local Supabase), Playwright (critical e2e flows)
- Package manager: pnpm

## Data access rules (important)

- **User-scoped reads and writes go through the Supabase server client with the user's
  session** (`src/lib/supabase/server.ts`) so Row Level Security is enforced.
- **Drizzle is used for schema/migrations, background jobs and admin tooling only.**
  A direct Postgres connection bypasses RLS — never use it to serve user-scoped data.
- Non-trivial logic that must respect RLS (room assignment, matching) lives in Postgres
  functions called via `supabase.rpc()`. Use `security invoker` unless a story says otherwise;
  any `security definer` function must validate `auth.uid()` itself and be reviewed.
- **Every new table ships with RLS enabled and policies in the same migration**, plus a
  test proving a user cannot read or write another user's private rows.
- RLS policies, Postgres functions and triggers live in custom SQL migrations
  (`pnpm drizzle-kit generate --custom --name=<name>`).
- The service-role key is only used in `src/lib/supabase/admin.ts`, only on the server,
  only for jobs/admin. Never import it into client components.

## Privacy and safety rules (non-negotiable)

- Contact handles (WhatsApp/Telegram) are readable only when an accepted
  `intro_request` exists between the two users — enforced by RLS, not just UI.
- Verification uploads go to a private bucket and are **deleted in the same action that
  approves or rejects them**.
- Collect the minimum data. Every profile field that isn't required is optional.
- Account deletion must remove the profile, handles, asks, memberships and uploads.
- Every user-generated text passes through rate limiting + moderation + the scam-pattern
  filter (`src/lib/safety/`) before it is published.
- Blocked users must be excluded inside the queries for feeds, matches and directories.
- Never log phone numbers, contact handles or document contents (Sentry scrubbing on).

## Repository layout

```
src/
  app/
    (public)/            # SEO pages, no auth: /[city], /[city]/companies/[company]/joining-dates,
                         #   /[city]/areas/[area], /[city]/tech-parks/[park]
    (auth)/              # login, callback
    (app)/               # authenticated: onboarding, home, rooms/[id], asks, people, settings
    admin/               # role-gated admin queues
    api/                 # route handlers (webhooks, cron entrypoints)
  features/              # onboarding/, rooms/, asks/, intros/, reports/, trust/ — UI + server actions per domain
  db/
    schema/              # Drizzle schema, one file per domain
    seed/                # Bengaluru cities/areas/tech parks/companies/offices
  lib/
    supabase/            # server.ts, client.ts, admin.ts
    analytics/           # PostHog wrapper + typed event names
    safety/              # rate limits, moderation, scam-pattern filter
    moderation.ts
drizzle/                 # generated + custom SQL migrations
tests/
  db/                    # RLS + function tests against local Supabase
  e2e/                   # Playwright
docs/
```

## Commands

```
pnpm dev                 # run app
pnpm lint && pnpm typecheck
pnpm test                # vitest
pnpm test:e2e            # playwright
supabase start           # local Supabase (Docker)
pnpm db:generate         # drizzle-kit generate
pnpm db:migrate          # drizzle-kit migrate
pnpm db:seed             # seed reference data
```
Create these scripts in `package.json` during Sprint 0 if they don't exist.

## Definition of done (every story)

- Acceptance criteria met
- `pnpm lint`, `pnpm typecheck`, `pnpm test` pass (and `pnpm test:e2e` if the story touches a critical flow)
- New tables have RLS + policy tests
- Analytics events listed in the story are emitted and named exactly as in `docs/VALIDATION.md`
- Mobile layout checked (most users are on phones)
- UI follows `docs/DESIGN.md` tokens (no ad-hoc colours or fonts)
- Backlog ticked + sprint log updated
- No secrets committed; new env vars added to `.env.example`

## Conventions

- Server Components by default; client components only for interactivity.
- Mutations via Server Actions with Zod-validated input; return typed results, not thrown strings.
- Public pages use ISR (`revalidate` 600–1800s) and read only from aggregate tables
  (`cohort_stats`, `area_stats`), never raw rows.
- Empty states are a feature: every list must have an intentional empty state that
  explains what will appear and invites the first action.
- Copy is plain, friendly, Indian-English; amounts in ₹.
- Small commits with conventional messages (`feat:`, `fix:`, `chore:`, `test:`).
