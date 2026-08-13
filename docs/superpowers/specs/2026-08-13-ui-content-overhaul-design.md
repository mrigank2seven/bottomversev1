# BOTTOMVERSE — UI & Content Overhaul

**Date:** 2026-08-13
**Status:** Approved, pending implementation plan

## Goal

Sharpen the existing brutalist streetwear identity, not replace it. The
palette (`--ink`, `--acid`, `--orange`, `--paper`, `--grey`), typefaces
(Archivo Black / DM Mono / Space Grotesk), and copy voice stay exactly as
they are. The work is: fix the architectural split-brain in nav/footer,
replace the single reused `clip-path` tee with a real SVG garment system,
add real motion, and close accessibility/SEO gaps that exist on 12 of 13
pages today.

## Current-state findings (baseline, verified against the repo)

- 13 HTML pages, 4 CSS files (`styles.css` 189 lines, `pages.css`,
  `story.css`, `fit-guide.css`), 2 JS files (`script.js` 347 lines,
  `fit-guide.js`).
- `index.html`, `drop.html`, `fit.html`, `style.html`, `story.html` ship a
  hardcoded nav ("Talk to us" CTA, 4 links) and 3-column footer directly in
  markup. At runtime, `script.js`'s `renderPrimaryNavigation`,
  `renderNavActions`, and `renderFooter` **replace** that markup with a
  different nav (adds Shop/Cart) and a 5-column footer. This causes a
  visible flash on every load and means the site has no working nav/footer
  at all with JS disabled.
- `css/styles.css` lines 12–24 and 27–36 duplicate `.nav-links`,
  `.nav-actions`, `.nav-shop`, `.cart-link`, `.cart-icon`, `.cart-count`
  declarations verbatim — leftover from iterative patching.
- Every product/garment visual (hero, product stage, fit diagram, measure
  card, shop card, cart thumbnail) reuses one `.tee` class with a single
  `clip-path: polygon(...)` shape.
- `images/` contains 6 files. `git log -S` confirms
  `heavyweight-tee.jpg`, `hero-menswear.jpg`, `tailored-overshirt.jpg`,
  `essential-shirt.jpg`, `fit-guide.jpg` were never referenced in any
  commit and are off-brand stock (a knit sweater, a suit, generic
  menswear) for a brand whose product is one 240 GSM oversized tee.
  `archit-kumar.jpg` is the real founder photo and is unused despite
  `story.html` having a `.story-founder` block with no image.
- Page copy is substantially complete already (support, account, story,
  and a fully-built fit-guide with a working size calculator). This is a
  structural/visual pass, not a copywriting pass — remaining content work
  is metadata, not prose.
- `:focus-visible` exists in exactly one place:
  `css/fit-guide.css:56`, scoped to `.fit-guide-page`. The other 12 pages
  have no visible keyboard focus state anywhere.
- No `prefers-reduced-motion` guard exists anywhere. The homepage ticker
  (`@keyframes ticker`, 15s infinite) runs unconditionally.
- 12 of 13 pages have no `<meta name="description">`. Only `story.html`
  has one. No Open Graph/Twitter card tags or JSON-LD structured data
  exist anywhere.

## Decisions

### Nav & footer: static-first (Approach A)

Bake the canonical nav (Home / Drop 001 / Oversized Fit / Style Lab, Shop
+ Cart actions) and the 5-column footer directly into all 13 pages'
HTML, matching what `script.js` currently renders at runtime. `script.js`
is trimmed to *enhancement only*: setting `.active` state, live cart
count, and the mobile menu toggle — it no longer builds nav/footer DOM
from scratch. This is the only approach where the site has working
navigation with JavaScript disabled and no flash-of-wrong-nav on load.
Rejected: JS-only rendering (nav pops in late, breaks with JS off) and a
build-time templating step (introduces tooling to a zero-dependency
static site for a 13-page win that doesn't justify it).

### Design tokens

Consolidate the ad-hoc per-selector `clamp()` display sizes (currently
~12 distinct ranges, e.g. `clamp(58px,8.4vw,128px)`,
`clamp(61px,7vw,108px)`, `clamp(62px,9vw,145px)`, all slightly different
for no reason) into 5 named display steps and one spacing scale, added as
CSS custom properties alongside the existing `--ink`/`--acid`/etc. in
`:root`. Existing duplicate blocks in `styles.css` (lines 12–24 vs
27–36) are removed as part of this pass, and the file is split into
clearly commented sections (base, nav, hero, sections, store, responsive)
— no new files, same file, better organized.

### SVG garment system

Replace the single `.tee` `clip-path` shape with 4 purpose-built inline
SVG symbols, defined once in a `<symbol>` sprite sheet and reused via
`<use>`:

- `#tee-front` — front-view tee with ribbed collar and hem lines. Hero
  and product stage (replaces current primary use).
- `#tee-tech` — technical blueprint/line-art rendering with dimension
  leader lines. Fit page and size/measure card — this is a direct fit for
  content that's already about measurement.
- `#tee-flat` — folded flat-lay silhouette. Shop grid cards and cart
  thumbnails (smaller, denser contexts).
- `#tee-body` — on-body silhouette outline. The three Style Lab looks.

A shared `feTurbulence`-based SVG filter provides a subtle fabric-weave
texture usable across all four, plus a halftone dot pattern for
background fill treatments (extending the existing sticker/badge
language rather than introducing a new one).

### Motion

All additions gated behind `@media (prefers-reduced-motion: no-preference)`,
which also becomes the first guard the existing ticker gets:

- IntersectionObserver-driven scroll reveals on section entry (fade +
  small translate, matching the existing sharp/no-easing brand feel —
  not a soft fade).
- Parallax offset on the hero tee/sticker on scroll.
- A second ticker row running the opposite direction beneath the
  existing one.
- Hard-offset shadow lift on hover for cards, extending the existing
  `box-shadow:20px 24px 0 rgba(16,16,16,.28)` language already used on
  `.tee-hero`/`.tee-product`.
- Count-up animation on the "240 GSM" figure when it scrolls into view.
- A fixed, low-opacity grain overlay across the page.

### Accessibility & SEO correctness

- `:focus-visible` outline (matching the orange one already defined for
  fit-guide) applied site-wide via the shared stylesheet, not per-page.
- `<meta name="description">`, Open Graph, and Twitter Card tags added to
  all 13 pages (currently 12 are missing them).
- JSON-LD: `Product` schema on `drop.html`/`shop.html`, `Organization` on
  `index.html`.
- `aria-label`/`<title>` on the new SVG symbols since they replace
  decorative-but-content-bearing `.tee` divs.
- Contrast spot-check on acid-green (`#c8ff00`) text/background
  combinations against WCAG AA; adjust only where it currently fails
  (palette values themselves are not being redesigned).

### Imagery

Delete `heavyweight-tee.jpg`, `hero-menswear.jpg`, `tailored-overshirt.jpg`,
`essential-shirt.jpg`, `fit-guide.jpg` — unused, off-brand, and superseded
by the SVG garment system. Keep `archit-kumar.jpg` and wire it into the
existing empty `.story-founder` slot in `story.html`.

## Explicit non-goals

- No new build step, framework, or dependency — stays a static site.
- No backend/payment integration — `checkout.html`'s simulated order flow
  is unchanged.
- No copy rewrite — existing page content is retained; only metadata
  (titles/descriptions/OG tags) is added where missing.
- No palette, typeface, or brand-voice changes.

## Scope

All 13 HTML pages, all 4 CSS files, both JS files. No new files except
the design tokens and SVG sprite live in the existing `css/styles.css`
and a new small inline `<svg>` sprite included via existing pages (exact
file placement to be decided in the implementation plan).

## Verification plan

- Visual check of every page at desktop and the existing 760px mobile
  breakpoint via local browser (no test framework exists in this repo).
- Confirm nav/footer render identically with JavaScript disabled.
- Keyboard-only pass: confirm every interactive element shows a visible
  focus ring.
- Confirm `prefers-reduced-motion: reduce` disables all new motion,
  including the pre-existing ticker.
