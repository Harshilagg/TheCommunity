# Design system

## Direction

Red ink on grainy paper. The reference is Bengaluru's own street vernacular:
hand-painted red "To-Let" boards, PG signboards and printed joining letters. The site should
feel like a well-kept notice board for newcomers, not a SaaS landing page.

**Spend boldness in one place: the headline type.** Everything else is quiet, left-aligned
and plain.

## Typography

Pairing inspired by *Trovical Calm + Futura 100*. During validation use free look-alikes;
switch to licensed originals (web licences needed) only after the Scale decision.

| Role | Validation font | Later (licensed) |
|------|-----------------|------------------|
| Capital letters in display headlines | Bodoni Moda italic 400 | Trovical Calm |
| Everything else | Jost (400 body, 500 UI, 900 display) | Futura (100 for display) |

### Headline treatment (the signature)

- The **first letter of each word** is the serif italic capital; the rest of the word is the
  heavy geometric sans. Example: `<F>ind <Y>our <P>eople`.
- Tight letter-spacing (-0.04em), line-height ~0.86, serif capital pulled in with
  `margin-right: -0.05em` so it tucks against the sans letters.
- Words can break across lines at different sizes (e.g. "Find Your" smaller, "People" larger).
- Headline text is **solid `ink`**, no texture on letters. All grain lives in the background.
- Build it once as a `<GrainHeadline words={[...]} />` component; never hand-style headlines.
- Use this treatment only for page heroes and a few section titles. Section headings, card
  titles and UI text are plain Jost 500 in sentence case.

### Text

- Body: Jost 400, 16–17px, line-height 1.55, max ~65 characters per line.
- Sentence case everywhere outside the hero headline.

## Colour

Primary red is **cherry**: a clean, slightly cool red (close to a classic poster/Swiss red).
It reads modern on the cream paper and avoids the brown or clay tones common in generated sites.

| Token | Hex | Use |
|-------|-----|-----|
| `paper` | `#F3EEDD` | page background |
| `paper-2` | `#E7DEC7` | the rare filled surface (avatar fallback, selected row) |
| `ink` | `#C8102E` | cherry red: headlines, primary button, links, table rules |
| `ink-hover` | `#A50D26` | primary button hover/pressed |
| `ink-deep` | `#3A0A12` | body text (near-black cherry) |
| `rule` | `rgba(200,16,46,0.30)` | table rules and dividers |
| `on-ink` | `#F3EEDD` | text on red buttons |
| `danger` | `#7A0A0A` + icon + bold weight | errors (must be distinguishable from brand red without colour) |
| `success` | `#3B5E1A` | confirmations |

Contrast on `paper`: `ink` ≈ 5:1 (passes AA for body text), `ink-deep` well above 10:1.

Alternates considered (swap only `ink`, `ink-hover`, `ink-deep`, `rule`):
- Oxblood `#8E1B2E` / deep `#2E0A10` — moodier, more premium, ≈ 7.7:1.
- Poppy `#D9381E` / deep `#3B120A` — brightest and most playful, but ≈ 4:1, so use it only
  for headlines and large text, never small body text or links.

## Paper grain (background only)

Two layered noise overlays on the page background, generated in CSS (no image files).
Text is never textured.

- **Coarse grain**: SVG `feTurbulence` fractalNoise, baseFrequency ≈ 0.75, numOctaves 4,
  desaturated, tile ~260px, `::before` overlay at ~0.34 opacity, `mix-blend-mode: multiply`.
- **Fine grain**: baseFrequency ≈ 2.2, numOctaves 2, desaturated, tile ~160px,
  `::after` overlay at ~0.22 opacity, `mix-blend-mode: multiply`.
- Overlays are `position: fixed` on `body` (in the real app) with `pointer-events: none`,
  and content sits above them (`z-index`).
- Check readability of `ink-deep` body text on the grained paper on a low-end phone screen;
  reduce coarse opacity before reducing contrast.

## Layout and components

- **Left-aligned** by default. Centre alignment only for genuinely centred moments (empty states).
- Show real content early: the landing hero is followed by a live table of joining dates,
  not feature cards.
- Lists of things (joining dates, asks, people) are **rows separated by rules**, not grids of
  identical cards.
- Buttons: primary = `ink` fill, small radius (3px). Secondary = text link in `ink` with underline.
  One primary button per screen.
- Radius is small and varies by role (buttons 3px, inputs 3px, the page panel 4px); no big rounded cards.
- Icons: only where they carry meaning (report, block, verified), outline style.

## Avoid (these read as AI-generated templates)

- Tracked-out ALL-CAPS labels above headings ("BENGALURU · NEWCOMERS").
- Meta strings joined with middle dots ("312 reported · 48 joining · 12 seeking").
  Write a sentence or use a table.
- A big number + small label stat strip in the hero.
- Identical rounded cards with soft grey shadows; gradient washes; glassmorphism.
- Pill buttons, "→" appended to button or link text.
- Monospace for small data labels; numbered markers (01 / 02 / 03) unless it's a real sequence.
- Fade-and-slide-up on every section, hover animations on every card.
- Tricolon marketing copy ("your batch, your flatmates, your area") and filler words
  ("seamless", "unlock", "empower", "journey").
- Extra decorative textures beyond the paper grain (dot patterns, blobs, sparkles).

## Copy

Plain, specific, from the newcomer's side: "Check when your batch is joining", not
"Discover your community". Buttons say exactly what happens ("Find your batch", "Say hi",
"Post your ask"). Empty states invite the first action ("No one from Wipro Sarjapur has reported yet. Add your joining date.").

## Motion

One page-load moment at most (the headline). Otherwise motion only responds to user actions
(opening an ask, accepting an intro). Respect `prefers-reduced-motion`.

## Dark mode

Not in the validation MVP.
