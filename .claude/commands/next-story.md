Pick up the next story from docs/BACKLOG.md.

1. Find the sprint marked ▶ and the first unticked story in it (or the story ID given here: $ARGUMENTS). Skip stories marked *(owner task)* and tell me about them instead.
2. Re-read CLAUDE.md, the relevant part of docs/ARCHITECTURE.md, and the analytics events for this story in docs/VALIDATION.md.
3. Write a short plan: files to create/change, migrations (including RLS policies), tests, analytics events. Stop and wait for my approval.
4. After approval, implement the smallest thing that meets the acceptance criteria. Do not build anything outside this story; put ideas in the Icebox.
5. Run lint, typecheck and tests (and e2e if a critical flow changed). Fix failures.
6. Tick the story in docs/BACKLOG.md, add a one-line entry to the Sprint log, and propose a conventional commit message.
