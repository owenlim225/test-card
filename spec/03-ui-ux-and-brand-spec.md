# 03 — UI/UX and Brand Specification

The workshop site is a **single, no-scroll homepage**: translucent header, centered **ProfileCard** (front + back, click-to-flip), and translucent footer — all over a full-viewport **MoltenMetal** background. The browser **reads** on-chain data only; participants create their `BuilderCard` via CLI (`create_builder_card`) and configure `VITE_PORTFOLIO_OBJECT_ID` before deploy.

**Canonical names (from `01` / `02`):**

| Layer | Name |
| ----- | ---- |
| Move struct | `BuilderCard` |
| Move entry | `create_builder_card` |
| React component | `ProfileCard` |
| Env (created Object ID) | `VITE_PORTFOLIO_OBJECT_ID` |

**Visual references:** repository root [`index.html`](../index.html) + [`style.css`](../style.css) (card markup and styling). Background shader: [`molten-metal.md`](../molten-metal.md). `[USER REQUIREMENT]` `[LOCKED]`

Source labels:

| Label | Meaning |
| ----- | ------- |
| `[REPOSITORY]` | Verified in the analyzed workshop repository |
| `[USER REQUIREMENT]` | Required by the reconstruction prompt |
| `[RECOMMENDATION]` | Simplification or modern tooling choice |
| `[LOCKED]` | Decision accepted for implementation — do not re-open |
| `[REMOVE]` | Present in older spec drafts; do not implement |

---

## 1. Cryptita Plays branding

**Must belong entirely to Cryptita Plays.** `[USER REQUIREMENT]`

| Token | Direction `[LOCKED]` |
| ----- | -------------------- |
| Voice | Clear, encouraging, beginner-friendly; not corporate legalese |
| Product line | Smart Contract to Website: Build & Deploy |
| Workshop label on card | `CRYPTITA PLAYS` / `BUILDER WORKSHOP 2026` (static chrome on card faces; **not** on-chain) |
| Look | Dark premium card on animated molten background — high contrast, restrained motion |
| Primary accent | `#42a5ff` (`--blue` in reference CSS) — card labels, links, emboss highlights |
| Card surfaces | `--card: #131318`, `--card-2: #0e0e13`, `--text: #f4f4f4`, `--muted: rgba(255,255,255,0.62)` |
| Header/footer chrome | Translucent dark band; target opacity **0.40–0.55** so MoltenMetal shows through |
| Page header logo | `cryptita long.svg` → `web/public/assets/cryptita-long.svg` (normalize filename; source file may have a space) |
| Card deboss/emboss | `cryptita.svg` as CSS mask on card faces (not a flat `<img>`) |
| Do not use | Original camp wordmarks, sample personal identity as production defaults, `public/profile.png` as on-chain substitute |

**Typography:** `Inter`, then `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`. No Google Fonts CDN in v1. At **design width** (~1020px), type sizes match the reference CSS; on smaller viewports the **entire card scales** — internal type and chips must **not** reflow independently (see §5). `[LOCKED]`

**MoltenMetal palette:** start from [`molten-metal.md`](../molten-metal.md) defaults (`colorMode: "molten"`, `mouseInteraction: true`). Background must read as premium and must not compete with the card.

---

## 2. Information architecture

**One page only.** No navigation, no secondary routes, no scroll. `[LOCKED]`

```text
App (100dvh, overflow: hidden)
├── MoltenMetal              fixed inset 0; z-index below chrome
├── Header                   absolute top band, translucent (~0.40–0.55)
│   └── cryptita-long.svg    linked logo
├── main                     flex center; uniform scale wrapper
│   └── ProfileCard          front + back; click-to-flip
└── Footer                   absolute bottom band, translucent (~0.40–0.55)
    ├── Social buttons       Facebook, LinkedIn (centered)
    └── Proof block          “Proof of Learning & Building” consent copy
```

### Removed UI `[REMOVE]` `[LOCKED]`

Do **not** ship any of the following:

| Removed | Notes |
| ------- | ----- |
| `WalletBar` | Connect Wallet, disconnect, address chip |
| `Hero` | Standalone avatar + socials layout |
| `AboutSkills` | Standalone about + skills sections |
| `Learn` | Sui / Move educational blurb section |
| `CreateForm` | Interact panel, transaction status, browser PTB |
| Proof-as-a-section | Object id lives on the card credential row only |
| Wallet providers / dapp-kit | No write path from the hosted site |

**Permitted interactions:** card flip, copy buttons (OBJECT ID, OWNER), outbound links (Sui, partners, socials, optional Suiscan on object id), header logo link.

---

## 3. Page layout

### 3.1 Viewport shell

| Rule | Value |
| ---- | ----- |
| Root height | `100dvh` |
| Overflow | `hidden` on `html`, `body`, and app root — **no vertical or horizontal scroll** |
| Background | **MoltenMetal** full viewport; **do not** use the `body` radial gradient from [`style.css`](../style.css) |
| Layering (z-index) | MoltenMetal (0) → header/footer chrome (10) → scaled card stage (20) |
| Pointer events | MoltenMetal canvas may receive mouse for drift per component source; card and chrome remain interactive above it |

### 3.2 Header

| Property | Spec |
| -------- | ---- |
| Position | Top band (`position: absolute` or equivalent), full width |
| Opacity | Translucent background ~**0.40–0.55**; logo remains legible |
| Content | Centered `web/public/assets/cryptita-long.svg` |
| Link | Entire logo (or wrapped `<a>`) is clickable — default href: [Cryptita Facebook](https://www.facebook.com/cryptitaplays) until a dedicated site URL is provided `[RECOMMENDATION]` |
| Height | Reserve vertical space in card scale calculation (§5); header must not overlap the card |

### 3.3 Main (card stage)

- Flexbox (or grid) centers the ProfileCard in the **remaining** viewport between header and footer bands.
- A **scale wrapper** applies `transform: scale(...)` uniformly — not responsive reflow inside the card.
- `perspective: 1600px` on the scale wrapper (from reference `.page-shell`).

### 3.4 Footer

| Property | Spec |
| -------- | ---- |
| Position | Bottom band, full width, same translucency as header (~0.40–0.55) |
| Social row | Two centered pill or icon buttons (see §8) |
| Proof block | Small, muted type below socials (§9) |
| Exclusions | No object id repeat (on card); no original organizer logos |

---

## 4. ProfileCard

Port DOM structure and class names from [`index.html`](../index.html). Port card CSS from [`style.css`](../style.css) into `web/src/styles/profile-card.css` **with these exclusions** `[LOCKED]`:

1. **Omit** `body` background and centering rules (MoltenMetal + app shell replace them).
2. **Omit** all `@media` breakpoint rules (`max-width: 900px`, `650px`, `440px`) that change grid columns, `aspect-ratio: auto`, `min-height`, padding stacks, or credential-row layout — scaling handles every viewport (§5).
3. **Keep** flip system, material noise/light, deboss/emboss, credential row, back-face partner strip, reduced-motion overrides.

At implementation time, prefer **fixed px sizes at design resolution** over `clamp()` / `vw` inside the card so scaling alone controls responsive appearance. `[RECOMMENDATION]`

### 4.1 Dimensions and internal proportions `[LOCKED]`

At **design size** (scale = 1, unscaled):

| Property | Value |
| -------- | ----- |
| Design width cap | **1020px** (reference `.page-shell` max) |
| Aspect ratio | **1.56 / 1** |
| Border radius | 32px |
| Flip transition | 700ms `cubic-bezier(0.2, 0.75, 0.2, 1)`; toggle class `is-flipped` on `.profile-card` |
| Perspective | 1600px on scale wrapper |

**Internal vertical bands (front face, % of card height):**

| Region | Height |
| ------ | ------ |
| `.card-top` | 18% |
| `.card-main` | 57% |
| `.card-bottom` | 18% (+ bottom margin per reference) |

**`.card-main` grid:** `25%` photo column · `1fr` details · gap 40px · horizontal padding 50px.

**`.info-grid` columns:** `minmax(0,1fr) minmax(0,1.5fr) minmax(0,0.8fr)` · gap 25px.

**Photo frame:** `aspect-ratio: 0.79 / 1` inside `.profile-photo-wrap`.

These proportions are **fixed at design resolution**. Narrow viewports scale the whole card; internal CSS must not switch to stacked/mobile layouts.

### 4.2 Flip interaction

Port behavior from [`script.js`](../script.js):

| Action | Behavior |
| ------ | -------- |
| Click card | Toggle `is-flipped` on `.profile-card` |
| Click `a` or `button` | **Do not** flip (use `event.target.closest("a, button")`) |
| Copy buttons | `stopPropagation()` so flip does not fire |
| Mouse light | Optional: set `--mx` / `--my` on pointer move over card; reset to 50% on leave |

Back-face emboss animation (`cryptitaLightSweep`, `cryptitaOuterGlow`) runs only while flipped (`.profile-card.is-flipped .back-logo-face { animation-play-state: running }`). Respect `prefers-reduced-motion: reduce`.

### 4.3 Front face — field mapping

Render **all on-chain `BuilderCard` fields except `about`**. Empty/error states use placeholders — never fake workshop sample identity (e.g. no hardcoded “Sherwin P. Limosnero”).

| UI label | Source | Notes |
| -------- | ------ | ----- |
| BUILDER NO. | `builder_no` | on-chain string |
| BUILDER (name) | `builder_name` | `<h1>` in `.identity-header`; `alt` on photo |
| PROFESSION | `profession` | |
| PROGRAM | `program` | |
| COUNTRY | `country` | |
| SPECIALIZATION | `specialization` | |
| BUILDING SINCE | `building_since` | |
| FOCUS | `focus` | |
| COMMUNITY | `community` | `.wide-field` |
| SKILLS | `skills` | comma-separated string → chips (§4.5) |
| Photo | `photo_url` | `<img src={photo_url}>` — **not** `public/profile.png` |
| ISSUED | `issued` | on-chain string (display as stored, e.g. `08-08-26`) |
| NETWORK | `VITE_SUI_NETWORK` | human label at read time, e.g. `Sui Mainnet` — **not** a Move field |
| OBJECT ID | `getObject` → `objectId` | truncated display + copy button (full value to clipboard) |
| OWNER | `getObject` → `owner` | AddressOwner (or equivalent); truncated + copy |
| Sui logo box | static asset | links to `https://www.sui.io/` |

**`about`:** stored on-chain for workshop/CLI completeness; **must not appear** in the DOM on this page. `[LOCKED]`

**Runtime-derived fields** (NETWORK, OBJECT ID, OWNER) are populated after `getObject` + env config — not passed to `create_builder_card`. Site may build with empty `VITE_PORTFOLIO_OBJECT_ID` (empty/error card until configure + rebuild).

**Suiscan:** OBJECT ID text or adjacent control may link to `https://suiscan.xyz/mainnet/object/{id}/fields`. `[RECOMMENDATION]`

Static card chrome (`CRYPTITA PLAYS`, `BUILDER WORKSHOP 2026`) stays as in the HTML reference; not loaded from chain.

### 4.4 Back face

Unchanged workshop layout from reference:

- Large embossed Cryptita mask (left, `.back-logo`)
- Brand title + workshop year (`.back-brand`)
- “Built on Sui” with logo link (`.back-built-on`)
- Community Partners row with fixed SVGs from `web/public/assets/`:

| Asset (normalize filename) | Alt label (reference) |
| -------------------------- | --------------------- |
| `devcon-laguna.svg` | DEVCON Philippines |
| `aws-uphsl.svg` | AWS UPHSL |
| `grantix.svg` | grantix |
| `kamiyon.svg` | Kamiyon Studio |

Partner `href` values may remain `#` until official URLs are supplied.

### 4.5 Skills chips

| Step | Rule |
| ---- | ---- |
| Input | Single on-chain string, e.g. `"Programming, Blockchain, Game Development"` |
| Parse | Split on `,`, trim whitespace, drop empty segments |
| Example | `"A, B,C"` → three chips: `A`, `B`, `C` |
| Output | One `<span>` per skill inside `.skills` — same visual style as reference |
| Interaction | Non-interactive (no hover lift required) `[RECOMMENDATION]` |

Chip wrap at design size is acceptable; **layout must not change** on smaller viewports except via uniform card scale (no breakpoint reflow).

### 4.6 Copy buttons

| Rule | Value |
| ---- | ----- |
| Truncate display | `0x` + first 4–6 chars + `…` + last 4–6 (match reference density) |
| `data-copy` / handler | Writes **full** object id or owner address to clipboard |
| Success affordance | Brief `✓` on button (~900ms), then restore `⧉` |
| Failure | Silent in UI; log to console if clipboard blocked |

### 4.7 Photo fallbacks

| State | Behavior |
| ----- | -------- |
| Valid `photo_url` | Load remote image; `object-fit: cover` |
| Missing / broken URL | Neutral placeholder frame; no stock portrait of a real person |
| Loading | Optional skeleton inside photo frame |

---

## 5. Card scaling and zoom `[LOCKED]`

The card must look identical at design proportions on every viewport; only its **scale** changes.

### 5.1 Design width (scale = 1)

Base formula from reference `.page-shell`:

```text
cardDesignWidth = min(
  1020,
  89vw,
  (availableHeight - headerBand - footerBand) * 1.56
)
```

- `availableHeight` = `100dvh` minus reserved header/footer band heights (implementation may use fixed bands, e.g. 48–64px each, or measure chrome after layout).
- At scale 1, card width **must not exceed 1020px**.

### 5.2 Smaller viewports

When the design-width card would not fit:

1. `fitScale = min(1, maxWidth / 1020, maxHeight / (1020 / 1.56))`
2. Apply `transform: scale(fitScale)` on the card scale wrapper; `transform-origin: center center`
3. **Do not** change font sizes, chip layout, grid columns, or credential-row structure for narrow screens

### 5.3 Larger viewports

When the viewport exceeds design size at 1020px width:

- Card stays at **1020px** design width (scale = 1)
- **Do not grow** the card to fill extra space
- Extra space shows more MoltenMetal; header/footer remain in top/bottom bands

### 5.4 Browser zoom (`visualViewport`)

Listen to `visualViewport` `resize` and `scroll`, plus `window` `resize`.

Counter browser zoom so **on-screen** card size stays stable:

```text
effectiveScale = fitScale / visualViewport.scale
```

Apply `transform: scale(effectiveScale)` so Ctrl/Cmd +/- does not enlarge the card past the design cap. Header and footer bands use the same zoom compensation or fixed `dvh` heights so chrome does not collide with the card.

### 5.5 Verification targets

| Viewport | Expectation |
| -------- | ----------- |
| 375×667 | Full card visible, no scroll, no chip/grid reflow |
| 768×1024 | Same |
| 1280×800 | Card at design cap, centered, not enlarged |
| 200% browser zoom | On-screen card size unchanged vs 100% zoom |

---

## 6. MoltenMetal background

| Property | Spec |
| -------- | ---- |
| Component | `MoltenMetal.tsx` + `MoltenMetal.css` from [`molten-metal.md`](../molten-metal.md) |
| Dependency | `ogl` |
| Container | `position: fixed; inset: 0; width: 100%; height: 100%; z-index: 0` |
| Default props | Documented defaults (`colorMode: "molten"`, `mouseInteraction: true`, etc.) unless brand review adjusts |
| Performance | Pause when off-screen or tab hidden (per source component) |
| Fallback | Optional solid `#020202` behind canvas before WebGL init `[RECOMMENDATION]` |

---

## 7. Assets

All static files under **`web/public/assets/`**:

| Asset | Use |
| ----- | --- |
| `cryptita-long.svg` | Page header logo |
| `cryptita.svg` | Card deboss/emboss CSS masks |
| `sui-logo.svg` | Front credential box + back “Built on Sui” |
| `devcon-laguna.svg` | Back face community row |
| `aws-uphsl.svg` | Back face community row |
| `grantix.svg` | Back face community row |
| `kamiyon.svg` | Back face community row |

Do not hotlink workshop sample photos. Participant photo comes **only** from on-chain `photo_url`.

---

## 8. Footer — social links and proof copy

### 8.1 Social buttons (centered)

| Label | URL | Tab policy |
| ----- | --- | ---------- |
| Facebook | `https://www.facebook.com/cryptitaplays` | `target="_blank"` `rel="noopener noreferrer"` |
| LinkedIn | `https://www.linkedin.com/company/cryptitaplays/` | same |

Use pill buttons or icon+text controls consistent with translucent footer chrome.

### 8.2 Proof of Learning & Building

Small centered block below social buttons. Required heading: **Proof of Learning & Building**.

Body copy (implement verbatim unless legal review replaces it):

> This page displays information stored immutably on Sui Mainnet by the workshop participant. Cryptita Plays provides the learning environment and tooling; on-chain content is supplied by the builder at creation time via CLI. By participating, you consent to your submitted profile fields and photo URL being publicly readable on-chain and rendered on this site.

Do not attribute original camp organizers. No immutability guarantees beyond educational framing.

---

## 9. UI states

| State | Behavior |
| ----- | -------- |
| Loading | Subtle inline indicator on card or skeleton fields; no full-page scroll |
| `VITE_PORTFOLIO_OBJECT_ID` empty | Card shows empty placeholders; credential row shows “Not configured” / em dash |
| Fetch error | Visible error on card; **no** hardcoded fallback identity |
| Success | All mapped fields populated; NETWORK from env; OBJECT ID / OWNER from `getObject` |
| Missing `photo_url` | Photo placeholder only |
| Clipboard denied | Copy button fails silently; no flip side effects |

There is **no** wallet, transaction, or form state on this page.

---

## 10. Visual hierarchy

1. **ProfileCard** — focal point; largest, centered, opaque
2. **Header logo** and **footer socials** — secondary; translucent, non-competing
3. **MoltenMetal** — atmosphere; lowest visual priority
4. **Credential row** (ISSUED / NETWORK / OBJECT ID / OWNER) — tertiary but always visible on front face

---

## 11. Accessibility (minimum)

- Semantic structure: `header`, `main` (card stage), `footer`
- `lang="en"` on `html`
- Real `<button>` for copy; real `<a>` for external links
- `alt={builder_name}` on photo when name is known; generic alt when empty
- Focus rings on all interactive controls
- Card flip is click/tap — ensure tab order reaches back-face partner links when flipped, or document flip as decorative for audit `[RECOMMENDATION]`
- Respect `prefers-reduced-motion` for flip duration and back emboss animations
- Contrast: body text on `#131318` card surfaces must meet WCAG AA

---

## 12. Motion

| Element | Motion |
| ------- | ------ |
| Card flip | 700ms ease (→ ~0ms if `prefers-reduced-motion`) |
| Back emboss | Sweep/glow only while flipped |
| MoltenMetal | Continuous shader; pauses off-tab |
| Hovers | Optional 150–160ms on links, copy, Sui box, partner logos |
| Skills chips | None |

Avoid wallet-dot pulses, hero parallax, or scroll-driven effects — there is no scroll.

---

## 13. Content and meta rules

- No default personal name, school, or social URLs in source or built HTML
- Placeholder example: “Your builder name will appear here after the object loads.”
- Document title: `{builder_name} · Cryptita Plays` after successful load; until then `Cryptita Plays — Builder Workshop`
- Do not render `about` anywhere on the homepage
- UI copy must not imply “connect wallet” or “submit form” — writes are **CLI + IDE only**

---

## 14. Component checklist (implementation)

| Component / hook | Responsibility |
| ---------------- | -------------- |
| `MoltenMetal.tsx` | Full-viewport WebGL background |
| `Header.tsx` | Translucent top band + linked long logo |
| `ProfileCard.tsx` | Front/back markup, flip, field binding, copy |
| `Footer.tsx` | Social links + Proof block |
| `usePortfolio` | `getObject` + env mapping; no write APIs |

**Not in scope:** `WalletBar`, `Hero`, `AboutSkills`, `Learn`, `CreateForm`, wallet providers for transactions.

---

## 15. Cross-references

| Topic | Spec |
| ----- | ---- |
| On-chain `BuilderCard` fields and CLI args | `04-sui-and-smart-contract-spec.md` |
| React file layout, CSS split, hook wiring | `05-frontend-implementation-spec.md` |
| Viewport / zoom / flip verification | `07-testing-and-verification-spec.md` |
| Env vars and deploy-after-create flow | `06-deployment-and-environment-spec.md` |
