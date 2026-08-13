# BOTTOMVERSE UI & Content Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the nav/footer split-brain, replace the single reused `clip-path` tee with a real SVG garment system, add motion behind `prefers-reduced-motion`, and close accessibility/SEO gaps — without changing the palette, typefaces, or copy voice.

**Architecture:** Zero-build static site (13 HTML files, 4 CSS files, 2 JS files, no dependencies). Nav/footer move from JS-rendered to static HTML baked into every page, with `script.js` trimmed to enhancement-only (active states are now static; JS only updates cart count and handles the mobile menu toggle). Garment art moves from one reused `<div class="tee">` `clip-path` shape to an inline SVG `<symbol>` sprite (4 variants) referenced via `<use>`, duplicated once per page (same tradeoff already accepted for nav/footer duplication — no build step exists to share partials).

**Tech Stack:** Vanilla HTML/CSS/JS, Google Fonts (Archivo Black, DM Mono, Space Grotesk), inline SVG. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-08-13-ui-content-overhaul-design.md`

## Global Constraints

- Palette stays exactly as defined in `css/styles.css:1` (`--ink:#101010; --acid:#c8ff00; --orange:#ff5630; --paper:#eeebe3; --grey:#c7c5bd`) — no new colors introduced.
- Typefaces stay exactly as defined (`--mono:'DM Mono'`, `--sans:'Space Grotesk'`, `--display:'Archivo Black'`) — no new typefaces.
- No copy rewrites — existing page text is preserved; only metadata (titles/descriptions/OG tags) is added where missing.
- No build step, framework, or dependency is introduced — site stays static.
- All new motion is gated behind `@media (prefers-reduced-motion: no-preference)`; the pre-existing ticker animation gets this guard too.
- No backend/payment changes — `checkout.html`'s simulated order flow in `js/script.js` is untouched.
- All 13 pages: `index.html`, `pages/drop.html`, `pages/fit.html`, `pages/style.html`, `pages/story.html`, `pages/contact.html`, `pages/coming-soon.html`, `pages/shop.html`, `pages/cart.html`, `pages/checkout.html`, `pages/account.html`, `pages/support.html`, `pages/fit-guide.html`.

---

## Task 1: Design tokens & CSS de-duplication

**Files:**
- Modify: `css/styles.css:1` (root token block), the 6 display-heading selectors listed in Step 2, `css/styles.css:12-24` and `css/styles.css:27-36` (duplicate nav/cart rules)

**Interfaces:**
- Produces: CSS custom properties `--space-1`..`--space-5`, `--display-xs`, `--display-sm`, `--display-md`, `--display-lg`, `--display-xl`, `--motion-fast`, `--motion-base` on `:root`, consumed by every later task's CSS.

- [ ] **Step 1: Add spacing/display/motion tokens to `:root`**

In `css/styles.css:1`, the current root block is:

```css
:root { --ink:#101010; --acid:#c8ff00; --orange:#ff5630; --paper:#eeebe3; --grey:#c7c5bd; --mono:'DM Mono',monospace; --sans:'Space Grotesk',sans-serif; --display:'Archivo Black',sans-serif; }
```

Replace with (same selector, new properties appended — no existing property is removed or changed):

```css
:root {
  --ink:#101010; --acid:#c8ff00; --orange:#ff5630; --paper:#eeebe3; --grey:#c7c5bd;
  --mono:'DM Mono',monospace; --sans:'Space Grotesk',sans-serif; --display:'Archivo Black',sans-serif;
  --space-1:8px; --space-2:16px; --space-3:24px; --space-4:48px; --space-5:96px;
  --display-xs: clamp(28px,3vw,48px);
  --display-sm: clamp(42px,5vw,80px);
  --display-md: clamp(58px,6.5vw,100px);
  --display-lg: clamp(62px,8vw,128px);
  --display-xl: clamp(62px,9vw,145px);
  --motion-fast: 200ms;
  --motion-base: 350ms;
}
```

- [ ] **Step 2: Retrofit the display headings the spec cites onto the new tokens**

The spec names three ad-hoc ranges as its motivating example — `clamp(58px,8.4vw,128px)`, `clamp(61px,7vw,108px)`, `clamp(62px,9vw,145px)` — and asks for consolidation into 5 named steps, not just declaring unused tokens. These 5 selector groups in `css/styles.css` already match the 5 tiers above almost exactly (the tier values were derived from them), so this is a direct swap, done in this same task since it's the same file and the tokens have no other consumer yet:

Find:

```css
.hero h1,.drop h2,.fit-title h2,.size-heading h2,.colour-title h2,.contact h2 { font:400 clamp(58px,8.4vw,128px)/.78 var(--display); letter-spacing:-.09em; margin:0; text-transform:uppercase; }
```

Replace with:

```css
.hero h1,.drop h2,.fit-title h2,.size-heading h2,.colour-title h2,.contact h2 { font:400 var(--display-lg)/.78 var(--display); letter-spacing:-.09em; margin:0; text-transform:uppercase; }
```

Find (in the `.fit-section` block) and delete this rule entirely — it's a standalone `108px`-max override that exists only because `.fit-title h2` needed a smaller size than its siblings in the rule above; consolidating means it now shares `--display-lg` like the rest of that selector group (a small, intentional visual size increase on this one heading, which is the point of consolidating "all slightly different for no reason" into shared steps):

```css
.fit-title h2 { font-size:clamp(61px,7vw,108px); }
```

Find:

```css
.product-copy h2 { font-size:clamp(48px,5.6vw,83px); margin-top:24px; }
```

Replace with:

```css
.product-copy h2 { font-size:var(--display-sm); margin-top:24px; }
```

Find:

```css
.store-heading h1,.checkout-intro h1,.store-empty h1,.order-success h1,.account-hero h1 { font:400 clamp(62px,9vw,145px)/.76 var(--display); letter-spacing:-.1em; margin:38px 0 0; text-transform:uppercase; }
```

Replace with:

```css
.store-heading h1,.checkout-intro h1,.store-empty h1,.order-success h1,.account-hero h1 { font:400 var(--display-xl)/.76 var(--display); letter-spacing:-.1em; margin:38px 0 0; text-transform:uppercase; }
```

Find:

```css
.shop-featured-head h2 { font:400 clamp(42px,6vw,80px)/.8 var(--display); letter-spacing:-.09em; margin:20px 0 0; }
```

Replace with:

```css
.shop-featured-head h2 { font:400 var(--display-sm)/.8 var(--display); letter-spacing:-.09em; margin:20px 0 0; }
```

Find:

```css
.shop-product-info h2 { font:400 clamp(28px,3vw,48px)/.85 var(--display); letter-spacing:-.07em; margin:16px 0 12px; max-width:400px; }
```

Replace with:

```css
.shop-product-info h2 { font:400 var(--display-xs)/.85 var(--display); letter-spacing:-.07em; margin:16px 0 12px; max-width:400px; }
```

The remaining scattered `clamp()` display sizes in `css/pages.css`, `css/story.css`, and elsewhere in `css/styles.css` (e.g. `.page-kicker h1`, `.story-hero h1`, `.support-intro h1`) are a materially larger retrofit (different files, no exact tier match) and stay out of scope for this plan, matching every other file this plan does not touch.

- [ ] **Step 3: Verify the retrofit**

Run: `grep -c 'var(--display-' css/styles.css`
Expected: `5` (one per selector group converted to a `var()` reference — the 6th selector group touched, `.fit-title h2`, is deleted outright rather than converted, since it falls through to the shared rule above instead).

Run: `grep -c 'clamp(61px,7vw,108px)' css/styles.css`
Expected: `0` (confirms the standalone `.fit-title h2` override was deleted, not just edited).

Open `pages/fit.html` in a browser and confirm the "ROOM TO MOVE." heading is visibly a bit larger than before (the intentional consolidation change) and still fits within the `.fit-title` column without overlapping the fit diagram.

- [ ] **Step 4: Remove the duplicate nav/cart block**

`css/styles.css` has two verbatim-identical rule blocks. The first (around line 12-24, introduced first) stays; delete the second (around line 27-36). Locate the second occurrence — it starts with:

```css
/* Shared information architecture */
.nav-links { align-items:center; min-width:0; }
```

and ends just before:

```css
footer { display:block; padding:0 clamp(22px,6vw,96px); }
```

Delete every rule in that second block that is a verbatim duplicate of a rule already present in the first block (`.nav-links`, `.nav-links a`, `.nav-links a.active`, `.nav-actions`, `.nav-shop,.cart-link`, `.nav-shop:hover,.cart-link:hover`, `.nav-shop.active`, `.cart-link`, `.cart-icon`, `.cart-count`). Keep the two rules in that section that are genuinely new (`.mobile-nav-divider`, `.mobile-nav-secondary`, `.mobile-nav-secondary a`, `.mobile-nav-shop`) — those don't exist in the first block.

- [ ] **Step 5: Verify no rule was lost**

Run: `grep -c '\.nav-shop,\.cart-link {' css/styles.css`
Expected: `1` (was `2` before this step — confirms the duplicate is gone, not both copies).

Run: `grep -c '\.mobile-nav-secondary {' css/styles.css`
Expected: `1` (confirms the non-duplicate rules survived).

- [ ] **Step 6: Commit**

```bash
git add css/styles.css
git commit -m "refactor: add design tokens, retrofit 6 display headings onto them, remove duplicate nav/cart CSS block"
```

---

## Task 2: SVG garment sprite system

**Files:**
- Create: sprite `<svg>` block (defined once below, copy-pasted into all 13 HTML files immediately after the opening `<body...>` tag, per the no-build-step constraint — see Task 3 for why duplication is the accepted approach)
- Modify: all 13 HTML files (insert sprite), `css/styles.css` (add `.garment-svg` positioning rule and remove old `.tee` clip-path rule, done fully in Task 4 alongside markup changes — this task only adds the sprite defs)

**Interfaces:**
- Produces: 4 reusable symbols — `#tee-front`, `#tee-tech`, `#tee-flat`, `#tee-body` — consumed by Task 4's markup changes on every page that currently renders a `.tee` div. Also produces `#fabric-weave` (SVG filter) and `#halftone-dots` (SVG pattern), consumed by Task 4's `.garment-svg` CSS and by the badge/sticker halftone step.

- [ ] **Step 1: Define the sprite block**

This exact block (hidden, not rendered) is inserted as the first child of `<body>` in every one of the 13 HTML files. Two shared primitives — `#fabric-weave` (a subtle `feTurbulence` filter, spec: "usable across all four" symbols) and `#halftone-dots` (a dot pattern for background fill treatments, extending the existing sticker/badge language) — are declared once here alongside the 4 symbols:

```html
<svg hidden aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="fabric-weave" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="weave"/>
      <feColorMatrix in="weave" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.05 0" result="weaveAlpha"/>
      <feComposite in="weaveAlpha" in2="SourceGraphic" operator="over"/>
    </filter>
    <pattern id="halftone-dots" width="8" height="8" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.1" fill="currentColor"/>
    </pattern>
    <symbol id="tee-front" viewBox="0 0 240 260">
      <path class="garment-outline" d="M40,0 Q62,20 84,22 Q120,32 156,22 Q178,20 200,0 L240,46 L195,84 L195,252 Q195,258 189,258 L51,258 Q45,258 45,252 L45,84 L0,46 Z" fill="var(--ink)"/>
      <path class="garment-rib" d="M70,20 Q120,34 170,20" fill="none" stroke="var(--acid)" stroke-width="2"/>
      <path class="garment-seam" d="M44,6 L86,26 M196,6 L154,26" fill="none" stroke="var(--paper)" stroke-opacity=".35" stroke-width="1"/>
      <line class="garment-hem" x1="45" y1="238" x2="195" y2="238" stroke="var(--paper)" stroke-opacity=".25" stroke-width="1"/>
    </symbol>
    <symbol id="tee-tech" viewBox="0 0 280 280">
      <path class="garment-outline" d="M60,20 Q82,40 104,42 Q140,52 176,42 Q198,40 220,20 L260,66 L215,104 L215,252 Q215,258 209,258 L71,258 Q65,258 65,252 L65,104 L20,66 Z" fill="none" stroke="var(--ink)" stroke-width="2" stroke-dasharray="5 4"/>
      <line x1="20" y1="4" x2="260" y2="4" stroke="var(--ink)" stroke-width="1"/>
      <line x1="20" y1="0" x2="20" y2="8" stroke="var(--ink)" stroke-width="1"/>
      <line x1="260" y1="0" x2="260" y2="8" stroke="var(--ink)" stroke-width="1"/>
      <text x="140" y="-8" text-anchor="middle" class="garment-dim">SHOULDER</text>
      <line x1="65" y1="104" x2="215" y2="104" stroke="var(--orange)" stroke-width="1"/>
      <text x="140" y="98" text-anchor="middle" class="garment-dim">CHEST</text>
      <line x1="276" y1="42" x2="276" y2="258" stroke="var(--ink)" stroke-width="1"/>
      <line x1="272" y1="42" x2="280" y2="42" stroke="var(--ink)" stroke-width="1"/>
      <line x1="272" y1="258" x2="280" y2="258" stroke="var(--ink)" stroke-width="1"/>
      <text x="278" y="150" text-anchor="middle" class="garment-dim" transform="rotate(90 278 150)">LENGTH</text>
    </symbol>
    <symbol id="tee-flat" viewBox="0 0 240 200">
      <path class="garment-outline" d="M60,10 Q120,26 180,10 L200,40 L165,58 L165,190 Q165,196 159,196 L81,196 Q75,196 75,190 L75,58 L40,40 Z" fill="var(--ink)"/>
      <path class="garment-fold" d="M40,40 L75,58 L75,140 L18,120 Z" fill="var(--ink)" opacity=".65"/>
      <path class="garment-fold" d="M200,40 L165,58 L165,140 L222,120 Z" fill="var(--ink)" opacity=".65"/>
      <path class="garment-rib" d="M92,10 Q120,22 148,10" fill="none" stroke="var(--acid)" stroke-width="2"/>
    </symbol>
    <symbol id="tee-body" viewBox="0 0 200 260">
      <path class="garment-outline" d="M70,4 Q100,16 130,4 L156,26 L128,50 L128,180 Q128,186 122,186 L78,186 Q72,186 72,180 L72,50 L44,26 Z" fill="none" stroke="var(--ink)" stroke-width="2.5"/>
      <path class="garment-drape" d="M100,50 Q94,110 100,180" fill="none" stroke="var(--ink)" stroke-width="1" stroke-opacity=".4"/>
    </symbol>
  </defs>
</svg>
```

- [ ] **Step 2: Insert the sprite into every page**

For each of the 13 files, insert the block from Step 1 as the very first line inside `<body>`, immediately after the `<body...>` opening tag (before the existing `<div class="shipping-bar">`). The `<body>` tag itself is unchanged (keep whatever classes it already has, e.g. `class="store-page"` on `shop.html`).

Files to edit: `index.html`, `pages/drop.html`, `pages/fit.html`, `pages/style.html`, `pages/story.html`, `pages/contact.html`, `pages/coming-soon.html`, `pages/shop.html`, `pages/cart.html`, `pages/checkout.html`, `pages/account.html`, `pages/support.html`, `pages/fit-guide.html`.

- [ ] **Step 3: Verify the sprite is present on every page**

Run: `grep -L 'id="tee-front"' index.html pages/*.html`
Expected: no output (empty — every file contains the sprite).

Run: `grep -L 'id="fabric-weave"' index.html pages/*.html`
Expected: no output (empty — confirms the filter/pattern defs travel with the symbols on every page, not just some).

- [ ] **Step 4: Commit**

```bash
git add index.html pages/*.html
git commit -m "feat: add SVG garment sprite (front/tech/flat/body symbols)"
```

---

## Task 3: Static nav & footer, trim script.js to enhancement-only

**Files:**
- Modify: `index.html`, all 12 files in `pages/`, `js/script.js:1-153` (everything up to and including the `renderFooter();` call)

**Interfaces:**
- Consumes: nothing from earlier tasks (independent of Task 1/2, but sequenced here because it's the largest structural change).
- Produces: static `.nav-links`, `.nav-actions`, `.mobile-nav`, `<footer>` markup on every page. `js/script.js` after this task exposes only `updateCartCount()`, `readCart()`, `writeCart()`, `cartQuantity()`, `formatPrice()` and the existing store/menu logic below line 153 — `renderPrimaryNavigation`, `createNavigationLink`, `isCurrentPage`, `renderNavActions`, `renderFooter`, and `primaryLinks` are deleted. Later tasks (5, 6) add new JS to this trimmed file; they must not reintroduce nav/footer DOM-building.

This is the architectural fix: `script.js` currently *overwrites* the nav/footer that's hardcoded in HTML, causing a visible flash and a no-JS nav failure. This task bakes in the same final markup `script.js` currently produces at runtime, then deletes the code that produced it.

### Canonical markup

Two contexts exist: **root** (`index.html`, links are `pages/...`, assets are `css/...`) and **nested** (everything in `pages/`, links to siblings are bare filenames, links home are `../index.html`, assets are `../css/...`).

**Root header+mobile-nav** (used only in `index.html`):

```html
<header class="nav"><a class="brand" href="index.html">BOTTOM<br><span>VERSE®</span></a>
  <nav class="nav-links">{{NAV_LINKS}}</nav>
  <div class="nav-actions"><a class="nav-shop{{SHOP_ACTIVE}}" href="pages/shop.html">Shop</a><a class="cart-link" href="pages/cart.html" aria-label="Cart, 0 items"><svg class="cart-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.4L21 8H6"/><circle cx="10" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg><span class="cart-label">Cart</span><span class="cart-count" hidden>0</span></a></div>
  <button class="menu-button" type="button" aria-label="Open navigation" aria-expanded="false"><i></i><i></i></button>
</header>
<nav class="mobile-nav">{{NAV_LINKS_MOBILE}}<span class="mobile-nav-divider" aria-hidden="true"></span><a href="pages/shop.html" class="mobile-nav-shop">Shop</a><div class="mobile-nav-secondary"><a href="pages/account.html#orders">Orders</a><a href="pages/account.html">Account</a><a href="pages/support.html">Support</a></div></nav>
```

Where `{{NAV_LINKS}}` / `{{NAV_LINKS_MOBILE}}` (identical link set, just two separate `<nav>` containers) is:

```html
<a href="index.html"{{H}}>Home</a><a href="pages/drop.html"{{D}}>Drop 001</a><a href="pages/fit.html"{{F}}>Oversized Fit</a><a href="pages/style.html"{{S}}>Style Lab</a><a href="pages/fit-guide.html"{{G}}>Size &amp; Fit Guide</a><a href="pages/story.html"{{ST}}>Our Story</a>
```

`{{H}}/{{D}}/{{F}}/{{S}}/{{G}}/{{ST}}` are each either empty string, or ` class="active" aria-current="page"` for exactly the one link matching the current page (see the Active-State Table below). `{{SHOP_ACTIVE}}` is either empty string or ` active`.

**Nested header+mobile-nav** (used in all 12 `pages/*.html` files) — identical except home link is `../index.html`, sibling links drop the `pages/` prefix, and the `menu-button`/structure is otherwise the same:

```html
<header class="nav"><a class="brand" href="../index.html">BOTTOM<br><span>VERSE®</span></a>
  <nav class="nav-links"><a href="../index.html"{{H}}>Home</a><a href="drop.html"{{D}}>Drop 001</a><a href="fit.html"{{F}}>Oversized Fit</a><a href="style.html"{{S}}>Style Lab</a><a href="fit-guide.html"{{G}}>Size &amp; Fit Guide</a><a href="story.html"{{ST}}>Our Story</a></nav>
  <div class="nav-actions"><a class="nav-shop{{SHOP_ACTIVE}}" href="shop.html">Shop</a><a class="cart-link" href="cart.html" aria-label="Cart, 0 items"><svg class="cart-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.4L21 8H6"/><circle cx="10" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg><span class="cart-label">Cart</span><span class="cart-count" hidden>0</span></a></div>
  <button class="menu-button" type="button" aria-label="Open navigation" aria-expanded="false"><i></i><i></i></button>
</header>
<nav class="mobile-nav"><a href="../index.html"{{H}}>Home</a><a href="drop.html"{{D}}>Drop 001</a><a href="fit.html"{{F}}>Oversized Fit</a><a href="style.html"{{S}}>Style Lab</a><a href="fit-guide.html"{{G}}>Size &amp; Fit Guide</a><a href="story.html"{{ST}}>Our Story</a><span class="mobile-nav-divider" aria-hidden="true"></span><a href="shop.html" class="mobile-nav-shop">Shop</a><div class="mobile-nav-secondary"><a href="account.html#orders">Orders</a><a href="account.html">Account</a><a href="support.html">Support</a></div></nav>
```

**Root footer** (`index.html`):

```html
<footer>
  <div class="footer-grid">
    <div class="footer-brand-block"><a class="brand" href="index.html">BOTTOM<br><span>VERSE®</span></a><p>MADE WITH TOO MUCH SPACE.</p></div>
    <div class="footer-column"><p>SHOP</p><a href="pages/shop.html">Shop</a><a href="pages/drop.html">Drop 001</a><a href="pages/fit.html">Oversized Fit</a><a href="pages/fit-guide.html">Size &amp; Fit Guide</a></div>
    <div class="footer-column"><p>EXPLORE</p><a href="pages/style.html">Style Lab</a><a href="pages/story.html">Our Story</a></div>
    <div class="footer-column"><p>SUPPORT</p><a href="pages/contact.html">Contact</a><a href="pages/support.html#shipping">Shipping</a><a href="pages/support.html#returns">Returns</a><a href="pages/support.html#faq">FAQ</a></div>
    <div class="footer-column"><p>ACCOUNT</p><a href="pages/account.html#orders">Orders</a><a href="pages/account.html">Account</a></div>
  </div>
  <div class="footer-bottom"><span>© 2026 BOTTOMVERSE</span><span>INDIA-WIDE SHIPPING / DROP 001 LIVE</span></div>
</footer>
```

**Nested footer** (all 12 `pages/*.html`):

```html
<footer>
  <div class="footer-grid">
    <div class="footer-brand-block"><a class="brand" href="../index.html">BOTTOM<br><span>VERSE®</span></a><p>MADE WITH TOO MUCH SPACE.</p></div>
    <div class="footer-column"><p>SHOP</p><a href="shop.html">Shop</a><a href="drop.html">Drop 001</a><a href="fit.html">Oversized Fit</a><a href="fit-guide.html">Size &amp; Fit Guide</a></div>
    <div class="footer-column"><p>EXPLORE</p><a href="style.html">Style Lab</a><a href="story.html">Our Story</a></div>
    <div class="footer-column"><p>SUPPORT</p><a href="contact.html">Contact</a><a href="support.html#shipping">Shipping</a><a href="support.html#returns">Returns</a><a href="support.html#faq">FAQ</a></div>
    <div class="footer-column"><p>ACCOUNT</p><a href="account.html#orders">Orders</a><a href="account.html">Account</a></div>
  </div>
  <div class="footer-bottom"><span>© 2026 BOTTOMVERSE</span><span>INDIA-WIDE SHIPPING / DROP 001 LIVE</span></div>
</footer>
```

### Active-State Table

This mirrors exactly what `js/script.js`'s `isCurrentPage`/`createNavigationLink`/`renderNavActions` currently compute at runtime (verified by reading `js/script.js` in full before writing this plan).

| Page | Active nav-links item | nav-shop active? |
|---|---|---|
| `index.html` | Home | no |
| `pages/drop.html` | Drop 001 | **yes** |
| `pages/fit.html` | Oversized Fit | no |
| `pages/style.html` | Style Lab | no |
| `pages/fit-guide.html` | Size & Fit Guide | no |
| `pages/story.html` | Our Story | no |
| `pages/shop.html` | none | **yes** |
| `pages/contact.html` | none | no |
| `pages/coming-soon.html` | none | no |
| `pages/cart.html` | none | no |
| `pages/checkout.html` | none | no |
| `pages/account.html` | none | no |
| `pages/support.html` | none | no |

`fit-guide.html` already has `class="active"` hardcoded on its "Oversized fit" link today (a pre-existing bug — it should be on "Size & Fit Guide"); this task corrects that as part of the rewrite.

- [ ] **Step 1: Replace `index.html` header/mobile-nav**

Old (`index.html`, current lines 14-17):
```html
<header class="nav"><a class="brand" href="index.html">BOTTOM<br><span>VERSE®</span></a>
      <nav class="nav-links"><a class="active" href="index.html">Home</a><a href="pages/drop.html">Drop 001</a><a href="pages/fit.html">Oversized fit</a><a href="pages/style.html">Style lab</a></nav><a class="nav-cta" href="pages/contact.html">Talk to us <span>↗</span></a><button class="menu-button" type="button" aria-label="Open navigation" aria-expanded="false"><i></i><i></i></button>
    </header>
    <nav class="mobile-nav"><a href="index.html">Home</a><a href="pages/drop.html">Drop 001</a><a href="pages/fit.html">Oversized fit</a><a href="pages/style.html">Style lab</a><a href="pages/contact.html">Contact us</a></nav>
```

New: the "Root header+mobile-nav" template above with `{{H}}=' class="active" aria-current="page"'`, all other slots empty, `{{SHOP_ACTIVE}}=''`.

- [ ] **Step 2: Replace `index.html` footer**

Old (current lines 39-41):
```html
<footer><a class="brand" href="index.html">BOTTOM<br><span>VERSE®</span></a>
      <p>© 2026 BOTTOMVERSE. MADE WITH TOO MUCH SPACE.</p><a href="pages/contact.html">CONTACT US ↗</a>
    </footer>
```

New: the "Root footer" template above, verbatim.

- [ ] **Step 3: Apply nested templates to the 12 `pages/*.html` files**

For each file below, replace its existing `<header class="nav">...</header>` + `<nav class="mobile-nav">...</nav>` pair with the "Nested header+mobile-nav" template (substituting the active slot per the table), and replace its `<footer>...</footer>` with the "Nested footer" template verbatim. The 8 files with legacy hardcoded nav (`drop.html`, `fit.html`, `style.html`, `story.html`, `contact.html`, `coming-soon.html`, `fit-guide.html`) have their old 4-link nav + `nav-cta`/footer replaced outright; the 5 files with empty JS-only placeholders (`shop.html`, `cart.html`, `checkout.html`, `account.html`, `support.html`) have their empty `<nav class="nav-links"></nav>` / `<nav class="mobile-nav"></nav>` / `<footer></footer>` filled in.

- `pages/drop.html`: `{{D}}=' class="active" aria-current="page"'`, `{{SHOP_ACTIVE}}=' active'`
- `pages/fit.html`: `{{F}}=' class="active" aria-current="page"'`
- `pages/style.html`: `{{S}}=' class="active" aria-current="page"'`
- `pages/story.html`: `{{ST}}=' class="active" aria-current="page"'`
- `pages/fit-guide.html`: `{{G}}=' class="active" aria-current="page"'` (also remove the stray `class="active"` currently on its "Oversized fit" link)
- `pages/contact.html`: all slots empty, `{{SHOP_ACTIVE}}=''` — note this file's header/footer also drop the now-obsolete `nav-cta active` "Talk to us" button and the `contact-mail`/back-to-home footer link, replaced by the standard nav-actions/footer (the mailto link stays in the page body's `.contact-options` section, untouched — it's only the header/footer wrapper being standardized)
- `pages/coming-soon.html`: all slots empty
- `pages/shop.html`: `{{SHOP_ACTIVE}}=' active'`, fill the three empty containers
- `pages/cart.html`, `pages/checkout.html`, `pages/account.html`, `pages/support.html`: all slots empty, fill the three empty containers

- [ ] **Step 4: Trim `js/script.js`**

Delete these declarations and their call sites (lines given are from the pre-edit file read during planning; confirm by content match, not line number alone, since earlier edits in this file may shift lines):

Delete the `primaryLinks` array (`js/script.js:29-36`), `isCurrentPage` function (`:38-41`), `createNavigationLink` function (`:43-52`), `renderPrimaryNavigation` function (`:54-73`), and the two calls `renderPrimaryNavigation('.nav-links'); renderPrimaryNavigation('.mobile-nav');` (`:80-81`).

Delete `renderNavActions` function (the one building `.nav-actions` DOM from `.nav-cta`) and replace its call site `renderNavActions();` with a direct `updateCartCount();` call — `renderNavActions`'s only remaining job (now that the markup is static) was calling `updateCartCount()`, so that single call is preserved standalone.

Delete `renderFooter` function and its call site `renderFooter();` entirely — footer is now static markup, nothing to render.

Keep everything else unchanged: `sharedPageStyles` injection, `pageRoot`/`assetRoot`/`homeRoot`/`shopRoot`/`cartRoot`/`accountRoot`/`supportRoot`/`cartStorageKey` constants (still used by the store-rendering functions below), `products`, `readCart`/`writeCart`/`cartQuantity`/`formatPrice`/`updateCartCount`, `showToast`, `addToCart`, `productVisual`/`productForm`/`renderShopPage`/`renderDropProductForm`/`renderCartPage`/`renderCheckoutPage`/`renderStorePages`, the `submit`/`click` event listeners, the menu-button toggle, and the swatch-click handler.

- [ ] **Step 5: Verify no page shows two navs**

Run: `grep -c 'class="nav-links"' index.html pages/drop.html pages/shop.html`
Expected: `1` for each file (confirms no leftover duplicate `.nav-links` container from an incomplete replace).

Run: `grep -c 'function renderFooter' js/script.js`
Expected: `0`.

- [ ] **Step 6: Manual no-JS check**

Open `index.html` directly in a browser with JavaScript disabled (or via browser devtools' "disable JavaScript"). Confirm: nav shows all 6 links + Shop/Cart, footer shows the 5-column grid, both match what the JS used to render. Repeat spot-check on `pages/shop.html` and `pages/cart.html` (the two pages that previously had fully empty nav/footer without JS).

- [ ] **Step 7: Commit**

```bash
git add index.html pages/*.html js/script.js
git commit -m "fix: bake nav and footer into static HTML, trim script.js to enhancement-only

Fixes the flash-of-wrong-nav on every page load and the complete
absence of navigation/footer with JavaScript disabled, both caused by
script.js overwriting hardcoded markup at runtime instead of the site
shipping the real nav/footer directly."
```

---

## Task 4: Swap the reused clip-path tee for the SVG garment system

**Files:**
- Modify: `index.html`, `pages/drop.html`, `pages/fit.html`, `pages/style.html`, `js/script.js` (`productVisual` and surrounding render functions), `css/styles.css` (`.tee`/`.tee-hero`/`.tee-product`/`.tee-diagram`/`.tee-measure`/`.shop-tee`/`.look:before`/`.look:after`/`.stage-badge`/`.sticker` rules)

**Interfaces:**
- Consumes: `#tee-front`/`#tee-tech`/`#tee-flat`/`#tee-body` symbols and `#fabric-weave`/`#halftone-dots` primitives from Task 2.
- Produces: `.garment-svg` CSS class (absolute-positioned, filtered SVG filling its wrapper) and `.badge-halftone` CSS class, consumed by no later task — this is the terminal consumer of the sprite.

### CSS changes

- [ ] **Step 1: Replace the old `.tee` rule with `.garment-svg` positioning, applying the shared fabric-weave filter**

In `css/styles.css`, find:

```css
.tee { background:#171717; clip-path:polygon(17% 0, 35% 9%, 65% 9%, 83% 0, 100% 18%, 80% 34%, 80% 100%, 20% 100%, 20% 34%, 0 18%); color:var(--paper); position:relative; }
```

Replace with:

```css
.garment-svg { filter:url(#fabric-weave); inset:0; position:absolute; height:100%; width:100%; }
```

`#fabric-weave` is a static filter (no animation/transition), so it is not gated behind `prefers-reduced-motion` — only actual motion is gated per the spec, and a fixed noise texture composited at 5% alpha isn't motion. Applying it via the shared `.garment-svg` class means every one of the 4 symbols gets it uniformly, matching the spec's "usable across all four."

The wrapper elements that used to carry `.tee` (`.tee-hero`, `.tee-product`, `.tee-diagram`, `.tee-measure`) already have `position:relative` from their own existing rules (verify — `.tee-hero` does via its own block; `.tee-product`, `.tee-diagram`, `.tee-measure` do too), so removing the shared `.tee` class does not remove positioning context. Text overlay rules (`.tee-hero span`, `.tee-hero b`, `.tee-hero i`, `.tee-product span/b/i`, `.tee-diagram b`, `.tee-measure b`) are untouched — they continue to position relative to the same wrapper.

- [ ] **Step 2: Update `.shop-tee` (used by both shop grid and cart thumbnails)**

Find:

```css
.shop-tee { bottom:-10px; height:500px; left:18%; position:absolute; transform:rotate(5deg); transition:transform .35s ease; width:64%; }
```

No change needed to this rule itself (it's a sizing/position wrapper, not the `.tee` shape rule) — it stays, since `productVisual()` in Task 4 Step 5 keeps the `.tee-product.shop-tee` wrapper class and only swaps what's inside it.

- [ ] **Step 3: Update Style Lab `.look` pseudo-elements**

Find (in `css/styles.css`, the `.colour-section`/`.look` block):

```css
.look:after { border:2px solid currentColor; border-radius:50% 50% 6% 6%; bottom:-135px; content:""; height:370px; position:absolute; right:-68px; transform:rotate(-12deg); width:260px; }
.look-black:before,.look-bone:before,.look-moss:before { border:24px solid currentColor; border-bottom:0; border-radius:50px 50px 0 0; bottom:-12px; content:""; height:255px; left:22%; position:absolute; transform:rotate(8deg); width:55%; }
```

Delete both rules (and the `.look-bone:before{color:#eeeae0}`/`.look-moss:before{color:#19231a}` color overrides that only existed to color those pseudo-elements) — they were a CSS-only stand-in abstraction for a garment shape. Add in their place:

```css
.look .garment-svg { bottom:-40px; height:340px; opacity:.9; position:absolute; right:-30px; stroke:currentColor; transform:rotate(-9deg); width:230px; }
.look .garment-svg .garment-outline { stroke:currentColor; stroke-width:2.5; }
```

- [ ] **Step 4: Verify old clip-path is gone**

Run: `grep -c 'clip-path' css/styles.css`
Expected: `0`.

- [ ] **Step 5: Add `.badge-halftone` styling for the halftone-dots pattern**

Spec: "a halftone dot pattern for background fill treatments (extending the existing sticker/badge language rather than introducing a new one)." The two existing badge/sticker elements are `.stage-badge` (`pages/drop.html`) and `.sticker-top` (`index.html`). Add `overflow:hidden` to the existing `.stage-badge` rule (so the pattern layer is clipped to the circle) and add a new rule:

Find:

```css
.stage-badge { align-items:center; background:var(--acid); border-radius:50%; bottom:24px; display:flex; flex-direction:column; font:400 32px/.73 var(--display); height:94px; justify-content:center; position:absolute; right:24px; transform:rotate(-13deg); width:94px; }
```

Replace with:

```css
.stage-badge { align-items:center; background:var(--acid); border-radius:50%; bottom:24px; display:flex; flex-direction:column; font:400 32px/.73 var(--display); height:94px; justify-content:center; overflow:hidden; position:absolute; right:24px; transform:rotate(-13deg); width:94px; }
```

Add, anywhere in the file:

```css
.badge-halftone { color:var(--ink); height:100%; inset:0; opacity:.15; position:absolute; width:100%; }
```

`.sticker` already has `position:absolute`, which is a valid containing block for its own absolutely-positioned children, so no change is needed to the `.sticker` rule itself for `.badge-halftone` to size correctly inside it.

- [ ] **Step 6: Add the halftone layer to `.stage-badge` (`pages/drop.html`)**

Old:

```html
<div class="stage-badge">240<br><small>GSM</small></div>
```

New:

```html
<div class="stage-badge"><svg class="badge-halftone" aria-hidden="true"><rect width="100%" height="100%" fill="url(#halftone-dots)"/></svg>240<br><small>GSM</small></div>
```

- [ ] **Step 7: Add the halftone layer to `.sticker-top` (`index.html`)**

Old:

```html
<div class="sticker sticker-top">240 GSM<br>100% COTTON</div>
```

New:

```html
<div class="sticker sticker-top"><svg class="badge-halftone" aria-hidden="true"><rect width="100%" height="100%" fill="url(#halftone-dots)"/></svg>240 GSM<br>100% COTTON</div>
```

At 15% opacity the dot pattern sits quietly behind the existing text in both cases — no legibility change to verify beyond the general visual check below.

### Markup changes

- [ ] **Step 8: `index.html` hero tee**

Old:
```html
<div class="tee tee-hero"><span>BV</span><b>OVERSIZED<br>IS THE<br>POINT.</b><i>DROP<br>001</i></div>
```

New:
```html
<div class="tee-hero"><svg class="garment-svg" aria-hidden="true"><use href="#tee-front"></use></svg><span>BV</span><b>OVERSIZED<br>IS THE<br>POINT.</b><i>DROP<br>001</i></div>
```

- [ ] **Step 9: `pages/drop.html` product-stage tee**

Old:
```html
<div class="tee tee-product"><span>bottom<br>verse</span><b>MADE FOR<br>EVERYDAY<br>CHAOS</b><i>01</i></div>
```

New:
```html
<div class="tee-product"><svg class="garment-svg" aria-hidden="true"><use href="#tee-front"></use></svg><span>bottom<br>verse</span><b>MADE FOR<br>EVERYDAY<br>CHAOS</b><i>01</i></div>
```

- [ ] **Step 10: `pages/fit.html` diagram tee and measure-card tee**

Old (diagram):
```html
<div class="tee tee-diagram"><b>BV</b></div>
```

New:
```html
<div class="tee-diagram"><svg class="garment-svg" aria-hidden="true"><use href="#tee-tech"></use></svg><b>BV</b></div>
```

Old (measure card, same file):
```html
<div class="tee tee-measure"><b>BV</b></div>
```

New:
```html
<div class="tee-measure"><svg class="garment-svg" aria-hidden="true"><use href="#tee-tech"></use></svg><b>BV</b></div>
```

- [ ] **Step 11: `pages/style.html` — add `#tee-body` mark to each of the 3 looks**

In each of the three `<article class="look look-*">` elements, add the SVG as the first child (before the existing `<span>` index number). Example for the first (`look-black`):

Old:
```html
<article class="look look-black"><span>01</span><h2>BLACKOUT</h2><p>Black tee / faded denim / silver hardware</p><i>EVERYDAY<br>UNIFORM</i></article>
```

New:
```html
<article class="look look-black"><svg class="garment-svg" aria-hidden="true"><use href="#tee-body"></use></svg><span>01</span><h2>BLACKOUT</h2><p>Black tee / faded denim / silver hardware</p><i>EVERYDAY<br>UNIFORM</i></article>
```

Apply the same pattern (insert the identical `<svg class="garment-svg" aria-hidden="true"><use href="#tee-body"></use></svg>` as the first child) to `look-bone` and `look-moss` articles.

- [ ] **Step 12: `js/script.js` — `productVisual()`**

Old:
```js
function productVisual(label = 'DROP<br>001') {
  return `<div class="tee tee-product shop-tee"><span>bottom<br>verse</span><b>${label}</b><i>01</i></div>`;
}
```

New:
```js
function productVisual(label = 'DROP<br>001') {
  return `<div class="tee-product shop-tee"><svg class="garment-svg" aria-hidden="true"><use href="#tee-flat"></use></svg><span>bottom<br>verse</span><b>${label}</b><i>01</i></div>`;
}
```

This single function is used by both `renderShopPage()` (shop grid cards) and `renderCartPage()` (cart thumbnails, which additionally scale it down via the existing `.cart-product-visual .shop-tee` CSS override) — no other change needed in either caller.

- [ ] **Step 13: Manual visual check**

Open `index.html`, `pages/drop.html`, `pages/fit.html`, `pages/style.html`, `pages/shop.html`, `pages/cart.html` (after adding an item to cart) in a browser. Confirm each garment renders as a visible shape (not a blank/broken `<use>`) and that overlay text (`BV`, `bottomverse`, size numbers) still sits in the same visual position as before. Confirm the fabric-weave texture reads as a faint grain on the garment fills, not an obvious/heavy pattern, and that scrolling `index.html`/`pages/style.html` (the pages with the most `.garment-svg` instances on screen at once) feels smooth with no visible jank from the filter. Confirm the halftone dot pattern is faintly visible behind the "240 GSM" text on both `index.html`'s sticker and `pages/drop.html`'s circular badge, without hurting legibility.

- [ ] **Step 14: Commit**

```bash
git add index.html pages/drop.html pages/fit.html pages/style.html js/script.js css/styles.css
git commit -m "feat: replace single clip-path tee with SVG garment system

Front/tech/flat/body variants replace one reused clip-path shape
across hero, product stage, fit diagram, measure card, shop grid,
cart thumbnails, and the three Style Lab looks. Adds the shared
fabric-weave filter to all four variants and a halftone-dot pattern
behind the GSM sticker/badge."
```

---

## Task 5: Motion — CSS (reduced-motion guard, second ticker row, shadow-lift, grain)

**Files:**
- Modify: `css/styles.css` (ticker rule, new grain/shadow-lift rules), `index.html` (second ticker row markup)

**Interfaces:**
- Produces: `.grain-overlay` element/rule and `[data-reveal]` CSS state (hidden-until-revealed), consumed by Task 6's JS.

- [ ] **Step 1: Gate the existing ticker behind `prefers-reduced-motion`**

Find in `css/styles.css`:

```css
.ticker div { animation:ticker 15s linear infinite; display:flex; width:max-content; }
```

Replace with:

```css
@media (prefers-reduced-motion: no-preference) {
  .ticker div { animation:ticker 15s linear infinite; display:flex; width:max-content; }
  .ticker.ticker-reverse div { animation-direction:reverse; animation-duration:19s; }
}
@media (prefers-reduced-motion: reduce) {
  .ticker div { display:flex; width:max-content; }
}
```

- [ ] **Step 2: Add a second, reversed ticker row**

In `index.html`, find:

```html
<section class="ticker">
        <div><span>LOOSE ON PURPOSE</span><b>✹</b><span>HEAVY ON QUALITY</span><b>✹</b><span>BUILT TO REPEAT</span><b>✹</b><span>LOOSE ON PURPOSE</span><b>✹</b></div>
      </section>
```

Replace with:

```html
<section class="ticker">
        <div><span>LOOSE ON PURPOSE</span><b>✹</b><span>HEAVY ON QUALITY</span><b>✹</b><span>BUILT TO REPEAT</span><b>✹</b><span>LOOSE ON PURPOSE</span><b>✹</b></div>
      </section>
      <section class="ticker ticker-reverse">
        <div><span>DROP 001 IS LIVE</span><b>✹</b><span>240 GSM COTTON</span><b>✹</b><span>MADE IN BAREILLY</span><b>✹</b><span>DROP 001 IS LIVE</span><b>✹</b></div>
      </section>
```

- [ ] **Step 3: Add shadow-lift hover, extending the existing hard-offset shadow language**

Add to `css/styles.css`, after the `.round-link:hover` rule:

```css
@media (prefers-reduced-motion: no-preference) {
  .shop-product-card, .look, .account-card, .support-list article { transition: box-shadow var(--motion-base) ease, transform var(--motion-base) ease; }
  .shop-product-card:hover, .account-card:hover, .support-list article:hover { box-shadow: 14px 16px 0 rgba(16,16,16,.22); transform: translate(-4px,-4px); }
}
```

- [ ] **Step 4: Add the grain overlay**

Add to `css/styles.css`, near the end (before the `@media (max-width:760px)` block):

```css
.grain-overlay { background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E"); inset:0; mix-blend-mode:multiply; opacity:.5; pointer-events:none; position:fixed; z-index:999; }
@media (prefers-reduced-motion: reduce) { .grain-overlay { display:none; } }
```

The grain is a static texture (no animation), so it isn't itself motion — it's hidden under `prefers-reduced-motion: reduce` anyway since some users pair that preference with a general request for a plainer UI, and hiding it costs nothing.

- [ ] **Step 5: Add the `<div class="grain-overlay"></div>` element to all 13 pages**

Insert as the last child of `<body>` (after the sprite from Task 2 and all other content, right before the closing `</body>` tag) in all 13 files.

- [ ] **Step 6: Add `[data-reveal]` base CSS for Task 6's scroll reveals**

Add to `css/styles.css`:

```css
@media (prefers-reduced-motion: no-preference) {
  [data-reveal] { opacity:0; transform:translateY(18px); transition:opacity var(--motion-base) ease, transform var(--motion-base) ease; }
  [data-reveal].is-visible { opacity:1; transform:translateY(0); }
}
```

Under `prefers-reduced-motion: reduce`, `[data-reveal]` elements get no rule at all, so they render at full opacity immediately — correct fallback with zero extra code.

- [ ] **Step 7: Verify the guard works**

Open `index.html` in a browser, open devtools, enable "Emulate CSS prefers-reduced-motion: reduce" (Chrome DevTools → Rendering tab). Confirm the ticker text is static (not scrolling) and the grain overlay is not visible.

- [ ] **Step 8: Commit**

```bash
git add css/styles.css index.html pages/*.html
git commit -m "feat: add motion CSS foundation (reduced-motion guard, second ticker row, shadow-lift, grain)"
```

---

## Task 6: Motion — JS (scroll reveal, parallax, count-up)

**Files:**
- Modify: `js/script.js` (append new code at end of file)

**Interfaces:**
- Consumes: `[data-reveal]`/`.is-visible` CSS states from Task 5.
- Produces: nothing consumed by later tasks — this is additive, self-contained behavior.

- [ ] **Step 1: Mark reveal targets**

In `index.html`, add `data-reveal` to the `<section class="ticker">`, `<section class="home-links">` elements (and their children as desired — keep it to section-level for now, matching the granularity of the existing brutalist block layout rather than per-element).

- [ ] **Step 2: Add the reveal/parallax/count-up script**

Append to `js/script.js`:

```js
if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
  const revealTargets = document.querySelectorAll('[data-reveal]');
  if (revealTargets.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    revealTargets.forEach((target) => revealObserver.observe(target));
  }

  const heroArt = document.querySelector('.hero-art');
  if (heroArt) {
    const heroTee = heroArt.querySelector('.tee-hero');
    const heroSticker = heroArt.querySelector('.sticker-top');
    window.addEventListener('scroll', () => {
      const offset = window.scrollY * 0.08;
      if (heroTee) heroTee.style.transform = `rotate(-9deg) translateY(${offset}px)`;
      if (heroSticker) heroSticker.style.transform = `rotate(8deg) translateY(${offset * -0.6}px)`;
    }, { passive: true });
  }

  const gsmSticker = document.querySelector('.sticker-top');
  if (gsmSticker) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        countObserver.unobserve(entry.target);
        const target = 240;
        const duration = 900;
        const start = performance.now();
        function tick(now) {
          const progress = Math.min((now - start) / duration, 1);
          const value = Math.round(target * progress);
          entry.target.innerHTML = `${value} GSM<br>100% COTTON`;
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });
    countObserver.observe(gsmSticker);
  }
}
```

- [ ] **Step 3: Manual check**

Open `index.html`, scroll the hero section — confirm the tee and sticker shift slightly at different rates (parallax). Reload and watch the "240 GSM" sticker as it scrolls into view — confirm it counts up from 0. Re-enable `prefers-reduced-motion: reduce` in devtools, reload, confirm none of this runs (sticker shows "240 GSM" immediately with no count, no parallax on scroll).

- [ ] **Step 4: Commit**

```bash
git add js/script.js index.html
git commit -m "feat: add scroll-reveal, hero parallax, and GSM count-up (reduced-motion gated)"
```

---

## Task 7: Accessibility — site-wide focus states and SVG labels

**Files:**
- Modify: `css/styles.css` (add `:focus-visible`), `css/fit-guide.css` (remove now-redundant scoped rule)

**Interfaces:**
- Consumes: nothing new.

- [ ] **Step 1: Add a site-wide focus-visible rule**

Add to `css/styles.css`, near the top (after the `:root` block from Task 1):

```css
:focus-visible { outline:2px solid var(--orange); outline-offset:3px; }
```

- [ ] **Step 2: Remove the now-redundant scoped rule**

In `css/fit-guide.css`, find:

```css
.fit-guide-page :focus-visible{outline:2px solid var(--orange);outline-offset:3px}
```

Delete it — the site-wide rule from Step 1 now covers this page too, with the identical outline color/offset (so no visual change on `fit-guide.html`).

- [ ] **Step 3: Verify contrast of the new orange focus ring**

`--orange:#ff5630` against `--paper:#eeebe3` and against `--ink:#101010` — both combinations exceed the 3:1 contrast ratio required for non-text UI indicators (WCAG 2.2 SC 1.4.11). No adjustment needed; this step is a confirmation, not a code change.

- [ ] **Step 4: Verify no double outline remains**

Run: `grep -c 'focus-visible' css/fit-guide.css`
Expected: `0`.

- [ ] **Step 5: Confirm garment SVG accessibility is already correct**

The `.garment-svg` instances added in Task 4 all carry `aria-hidden="true"`, which is correct in every case — hero, product-stage, diagram, measure-card, and shop cards all have adjacent visible text describing the product, and the three Style Lab `look` SVGs sit alongside an `<h2>` colorway name and a full outfit description `<p>`. No markup change is needed in this step; it's a verification that Task 4's `aria-hidden` usage needs no follow-up.

- [ ] **Step 6: Manual keyboard check**

Tab through `index.html` using only the keyboard. Confirm every link, button, and form control (nav links, cart link, mobile menu button, hero CTA, swatch buttons) shows a visible orange outline when focused. Repeat on `pages/checkout.html` (form inputs) and `pages/fit-guide.html` (calculator buttons/inputs).

- [ ] **Step 7: Commit**

```bash
git add css/styles.css css/fit-guide.css
git commit -m "fix: apply focus-visible outline site-wide instead of one page"
```

---

## Task 8: SEO metadata (descriptions, Open Graph, Twitter Card, JSON-LD)

**Files:**
- Modify: all 13 HTML files' `<head>` blocks

**Interfaces:**
- Consumes: nothing.

- [ ] **Step 1: Add description + OG/Twitter tags to each page missing them**

Insert immediately after each file's `<title>` line (or after the existing `<meta name="description">` for `story.html`/`fit-guide.html`, which already have one and should not get a duplicate). Use this per-page table — insert a `<meta name="description" content="...">` (only for the 11 files that don't already have one) followed by the OG/Twitter block with that same title/description substituted:

| File | Title (existing, unchanged) | Description to add |
|---|---|---|
| `index.html` | BOTTOMVERSE — Not Your Basic Tee | Heavyweight oversized tees made in Bareilly, India. 240 GSM combed cotton, boxy fit, dropped shoulder. Drop 001 is live. |
| `pages/drop.html` | Drop 001 — BOTTOMVERSE | Drop 001: one heavyweight oversized tee in three washed shades. 240 GSM combed cotton, boxy body, dropped shoulder. |
| `pages/fit.html` | Oversized Fit — BOTTOMVERSE | Understand the Bottomverse oversized fit — dropped shoulder, wide sleeve, longer length — and find your size with our measuring guide. |
| `pages/style.html` | Style Lab — BOTTOMVERSE | Three ways to wear the Drop 001 tee: Blackout, Bone, and Moss. Styling rules for balancing volume and keeping the palette tight. |
| `pages/contact.html` | Contact — BOTTOMVERSE | Get in touch with Bottomverse for early access, drop updates, or general questions. |
| `pages/coming-soon.html` | Work in Progress — BOTTOMVERSE | This part of Bottomverse is still being built. Check back soon. |
| `pages/shop.html` | Shop — BOTTOMVERSE | Shop Drop 001: the Bottomverse heavyweight oversized tee in Blackout, Bone, and Moss. India-wide shipping. |
| `pages/cart.html` | Cart — BOTTOMVERSE | Review your Bottomverse cart before checkout. |
| `pages/checkout.html` | Checkout — BOTTOMVERSE | Secure checkout for your Bottomverse order. India-wide shipping on Drop 001. |
| `pages/account.html` | Account — BOTTOMVERSE | Manage your Bottomverse account and view order history. |
| `pages/support.html` | Support — BOTTOMVERSE | Shipping, returns, and answers to common Bottomverse questions. |

`pages/story.html` and `pages/fit-guide.html` keep their existing descriptions unchanged — only the OG/Twitter block is new for those two.

OG/Twitter block template (insert with `{{TITLE}}`/`{{DESC}}`/`{{ROOT}}` substituted — `{{ROOT}}` is `""` for `index.html`, `"../"` for files in `pages/`):

```html
<meta property="og:title" content="{{TITLE}}">
<meta property="og:description" content="{{DESC}}">
<meta property="og:type" content="website">
<meta property="og:image" content="{{ROOT}}images/logo.png">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="{{TITLE}}">
<meta name="twitter:description" content="{{DESC}}">
```

- [ ] **Step 2: Add JSON-LD Organization schema to `index.html`**

Insert before `</head>` in `index.html`:

```html
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Organization","name":"BOTTOMVERSE","logo":"images/logo.png","email":"bottomverse.shop@gmail.com","description":"Heavyweight oversized tees made in Bareilly, Uttar Pradesh."}
</script>
```

- [ ] **Step 3: Add JSON-LD Product schema to `pages/drop.html` and `pages/shop.html`**

Insert before `</head>` in both files (data matches the existing `products` array in `js/script.js` exactly — price 1799, description text):

```html
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Product","name":"Drop 001 / Heavyweight Tee","description":"240 GSM combed cotton. Boxy body. Dropped shoulder.","brand":{"@type":"Brand","name":"BOTTOMVERSE"},"offers":{"@type":"Offer","priceCurrency":"INR","price":"1799","availability":"https://schema.org/InStock"}}
</script>
```

- [ ] **Step 4: Verify every page has a description**

Run: `grep -L 'name="description"' index.html pages/*.html`
Expected: no output (empty).

- [ ] **Step 5: Validate JSON-LD syntax**

Run: `node -e "JSON.parse(require('fs').readFileSync('index.html','utf8').match(/application\/ld\+json">(.*?)<\/script>/s)[1])" && echo OK`
Expected: `OK` (confirms the embedded JSON is syntactically valid; repeat for `pages/drop.html` and `pages/shop.html` with the same command pointed at each file).

- [ ] **Step 6: Commit**

```bash
git add index.html pages/*.html
git commit -m "feat: add meta descriptions, Open Graph/Twitter tags, and JSON-LD to all pages"
```

---

## Task 9: Imagery cleanup

**Files:**
- Delete: `images/heavyweight-tee.jpg`, `images/hero-menswear.jpg`, `images/tailored-overshirt.jpg`, `images/essential-shirt.jpg`, `images/fit-guide.jpg`
- Modify: `pages/story.html`, `css/story.css`

**Interfaces:**
- Consumes: nothing.

- [ ] **Step 1: Delete the unused off-brand images**

```bash
git rm images/heavyweight-tee.jpg images/hero-menswear.jpg images/tailored-overshirt.jpg images/essential-shirt.jpg images/fit-guide.jpg
```

- [ ] **Step 2: Confirm nothing references the deleted files**

Run: `grep -rl 'heavyweight-tee.jpg\|hero-menswear.jpg\|tailored-overshirt.jpg\|essential-shirt.jpg\|fit-guide.jpg' index.html pages/ css/ js/`
Expected: no output (confirms these were genuinely unused, matching the `git log -S` finding from the spec).

- [ ] **Step 3: Wire the founder photo into `pages/story.html`**

Old (in `pages/story.html`):

```html
<div class="story-founder-copy"><strong>Archit Kumar</strong>
          <p>Founder, product obsessive, and the person building Bottomverse in public. From the first fabric swatch to the first drop, the goal stays simple: make everyday clothes with enough character to become your everyday clothes.</p>
        </div>
```

New:

```html
<div class="story-founder-copy"><img class="founder-photo" src="../images/archit-kumar.jpg" alt="Archit Kumar, founder of Bottomverse, at a gallery show"><strong>Archit Kumar</strong>
          <p>Founder, product obsessive, and the person building Bottomverse in public. From the first fabric swatch to the first drop, the goal stays simple: make everyday clothes with enough character to become your everyday clothes.</p>
        </div>
```

- [ ] **Step 4: Add `.founder-photo` styling to `css/story.css`**

Add:

```css
.founder-photo { border:1px solid var(--acid); display:block; filter:grayscale(1); height:220px; margin-bottom:24px; object-fit:cover; object-position:top; width:220px; }
```

- [ ] **Step 5: Manual visual check**

Open `pages/story.html`, confirm the founder photo renders (grayscale, square, acid-green border) above the founder name/copy in the `.story-founder` section, and that image dimensions don't distort the existing 2-column layout.

- [ ] **Step 6: Commit**

```bash
git add -A images/ pages/story.html css/story.css
git commit -m "chore: delete unused off-brand stock photos, wire founder photo into story page"
```

---

## Self-Review Notes

- **Spec coverage:** nav/footer fix (Task 3), design tokens + CSS dedup + display-heading retrofit (Task 1), SVG garment system including the shared fabric-weave filter and halftone-dots pattern (Tasks 2, 4), motion behind `prefers-reduced-motion` (Tasks 5, 6), accessibility (Task 7), SEO (Task 8), imagery (Task 9) — every spec section maps to at least one task.
- **No test framework exists in this repo** (confirmed during spec research — no `package.json`, no test runner). "Test" steps in this plan are `grep`-based structural verification plus manual browser checks, matching the spec's own Verification Plan section rather than inventing a test framework this static site doesn't have.
- **Type/name consistency check:** `.garment-svg` (Task 2/4), `.badge-halftone` (Task 4), `[data-reveal]`/`.is-visible` (Task 5/6), `#tee-front`/`#tee-tech`/`#tee-flat`/`#tee-body`/`#fabric-weave`/`#halftone-dots` (Task 2, consumed identically in Task 4), `--display-xs`/`--display-sm`/`--display-lg`/`--display-xl` (Task 1, defined and consumed in the same task) — all names match across the tasks that define vs. consume them.
- **Revision note (post-commit patch):** this plan was committed once already (`6dc48aa`), then patched in a follow-up pass before execution to close two gaps found on review: (1) the spec's shared `feTurbulence` fabric-weave filter and halftone-dots pattern were missing from the sprite entirely — added to Task 2 and wired up in Task 4 (`.garment-svg` filter + `.badge-halftone` on the GSM sticker/badge); (2) the design-token step declared tokens but didn't apply any of them — Task 1 now retrofits the 6 selector groups matching the spec's own cited `clamp()` examples onto the new `--display-*` tokens. Remaining scattered `clamp()` calls in `pages.css`/`story.css` and elsewhere in `styles.css` are explicitly still out of scope (no exact tier match, different files).
- **Known deviation from the spec's abbreviated nav description:** the spec's Decisions section describes the canonical nav-links as "Home / Drop 001 / Oversized Fit / Style Lab, Shop + Cart actions" (4 items), but also says this must match "what `script.js` currently renders at runtime" — and `script.js`'s actual `primaryLinks` array renders 6 items (adding Size & Fit Guide and Our Story). This plan's Active-State Table (Task 3) follows the verified 6-link runtime behavior, treating the spec's prose as an abbreviation rather than a literal exhaustive list, since the spec itself names runtime behavior as the source of truth.
- Task ordering matters: Task 2 (sprite) before Task 4 (swap markup to use it); Task 5 (CSS reveal states) before Task 6 (JS that toggles them); Task 3 (nav/footer) is independent and could run in parallel with Task 1/2, but is sequenced early since it's the highest-value fix.
