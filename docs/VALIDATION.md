# Validation plan

This first version exists to answer one question:

> **Can we attract enough newcomers, and connect enough of them, that PG / co-living
> operators would pay to reach them?**

We build the smallest product that can answer it, measure honestly, and then decide
to **scale**, **iterate** or **stop**.

All target numbers below are starting guesses. Adjust them in Sprint 0 and write down
the final values *before* launch so the decision later isn't biased by the results.

## Hypotheses

| # | Hypothesis | What would prove it wrong |
|---|------------|---------------------------|
| H1 | Freshers search for joining dates / living near their office, and our public pages can rank for it | Public pages get almost no organic impressions 6 weeks after indexing |
| H2 | Visitors who land will sign up to "find their batch" | Landing → signup conversion stays very low |
| H3 | People will make real connections (intros accepted) across batch, place and need | Most activated users never send or receive an intro |
| H4 | Users come back (joining-date updates, matches, replies) | Almost nobody returns in week 2 |
| H5 | A meaningful share of users need housing, and operators will pay for leads | Few housing asks; operators won't commit to a price |

## Metrics and targets (edit before launch)

Measured over the **6-week window after public launch**.

| Metric | Definition | Starting target |
|--------|------------|-----------------|
| Organic traffic | Weekly unique visitors to public pages from search | 1,500/week by week 6 |
| Signup conversion | Public page visitor → account created | ≥ 6% |
| Activation | Signup → onboarding completed | ≥ 70% |
| Connection rate | Activated users who send or receive ≥1 intro within 14 days | ≥ 35% |
| Intro acceptance | Accepted / sent intro requests | ≥ 30% |
| Week-2 return | Activated users active again 7–14 days after signup | ≥ 25% |
| Content supply | Cohort pages with ≥ 10 joining reports | ≥ 10 pages |
| Housing demand | Activated users with a flatmate / PG / room ask | ≥ 30% |
| Revenue intent (users) | Users with a housing ask who click the "Verified PGs near your office" fake door | ≥ 15% |
| Revenue intent (operators) | PG/co-living operators contacted who agree to a paid pilot at a price they name | ≥ 3 of 15 |

## Decision gate (end of the 6-week window)

- **Scale** — H1 and H3 clearly pass, and H5 shows real willingness to pay:
  move to paid tiers, add notifications + groups + area guide, add the next companies,
  start a paid partner pilot.
- **Iterate** — traffic is there but connections are weak (or the reverse):
  run 2–3 more sprints targeting the weakest metric only, then re-evaluate.
- **Stop / pivot** — no organic traction and no operator interest: keep the learnings,
  don't pour more time in.

Record the decision and the numbers in `docs/BACKLOG.md` under "Sprint log".

## Revenue test (no payments code in the MVP)

1. **Fake door**: users with a housing ask see a card "Verified PGs & co-living near
   [office]". Clicking opens "We're onboarding verified partners in your area — want
   us to share options when they're ready?" with a consent checkbox. Measure clicks and opt-ins.
2. **Operator conversations** (manual, outside the app): contact ~15 PG/co-living operators
   near the launch tech parks, show anonymised demand numbers from `area_stats`, ask
   what they'd pay per qualified lead or per month. Log results in the sprint log.
3. Only build real partner listings after the gate says **Scale**.

## Analytics events (PostHog) — use these exact names

| Event | Properties |
|-------|-----------|
| `public_page_viewed` | page_type (`company_dates`/`area`/`tech_park`/`city`), city, slug, referrer_type |
| `cta_find_batch_clicked` | page_type, slug |
| `signup_completed` | method (`google`/`email`) |
| `onboarding_step_completed` | step |
| `onboarding_completed` | reason, has_company, has_joining_date, areas_count, intents |
| `rooms_assigned` | count, kinds |
| `room_viewed` | room_kind |
| `post_created` | room_kind, kind (`discussion`/`question`) |
| `reply_created` | room_kind |
| `joining_report_submitted` | company, office, verified |
| `ask_created` | type, areas_count, verified_only, women_only |
| `ask_matches_shown` | type, match_count |
| `people_directory_viewed` | area, filters |
| `intro_requested` | source (`match`/`directory`/`ask`/`room`), ask_type |
| `intro_responded` | status (`accepted`/`declined`) |
| `contact_revealed` | — |
| `fake_door_pg_clicked` | area, office |
| `fake_door_pg_opted_in` | area, office |
| `verification_submitted` / `verification_decided` | type / status |
| `report_submitted` | target_type |
| `digest_email_opened` | — (via Resend webhook if available) |

Identify users in PostHog by an internal UUID only — never phone number or email.

## Dashboards to build in PostHog (Sprint 5)

1. Funnel: `public_page_viewed` → `cta_find_batch_clicked` → `signup_completed` → `onboarding_completed` → `intro_requested` → `intro_responded(accepted)`
2. Weekly organic traffic by page_type
3. Retention: week-2 return for activated users
4. Housing demand + fake-door conversion by area
