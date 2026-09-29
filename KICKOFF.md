# Kickoff — getting started with Claude Code

## Before the first session (accounts)

Create (free tiers are fine for the build): GitHub repo, Supabase (Mumbai region), Vercel,
PostHog, Sentry, Resend, Upstash, Google Cloud OAuth client. Start MSG91 DLT registration
now — approval can take a while and phone OTP depends on it.
Check the current pricing and plan terms of each service before launch (for example,
whether a free/hobby tier permits commercial use and whether free databases pause when idle).

Local tools: Node.js LTS, pnpm, Docker (for local Supabase), Supabase CLI, Claude Code.

## Set up the repo

1. Create an empty repo and copy in: `CLAUDE.md`, `docs/`, `.claude/commands/`.
2. Open a terminal in the repo and run `claude`.
3. Paste the first prompt below.

## First prompt

> Read CLAUDE.md and everything in docs/. Summarise back to me, in a few sentences, what
> we're building, why this first version is a validation experiment, and how we'll work
> sprint by sprint. Then list any questions or contradictions you see in the docs.
> Don't write code yet.

Then run `/next-story` to start S0-1, and keep using `/next-story` story by story.
Run `/sprint-review` at the end of every week.

## Tips

- Keep each session to one story; start a fresh session when a story is done.
- Review every migration and RLS policy yourself — that's where privacy bugs hide.
- If Claude proposes something outside the current story, ask it to put it in the Icebox.
