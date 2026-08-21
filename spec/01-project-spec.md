# 01 — Project Specification

**Project:** Cryptita Plays — Smart Contract to Website: Build & Deploy  
**Application type:** Workshop builder-card homepage (read-only on-chain demo)  
**Status:** Specification only. Do not implement from this file alone; use the full `/spec` package.

**Canonical on-chain name:** `BuilderCard` (Move struct, module references, and workshop copy). The Vite env key remains `VITE_PORTFOLIO_OBJECT_ID` for workshop continuity; it holds the **created Object ID**, not a package ID.

Source labels used throughout this package:

| Label | Meaning |
| ----- | ------- |
| `[REPOSITORY]` | Verified in the analyzed workshop repository or local card prototype (`index.html`, `style.css`) |
| `[USER REQUIREMENT]` | Required by the reconstruction prompt |
| `[RECOMMENDATION]` | Simplification or modern tooling choice |
| `[UNKNOWN]` | Not verifiable from the original repo; **locked defaults below** apply unless brand assets arrive later |
| `[REMOVE]` | Present in original; do not carry forward |
| `[LOCKED]` | Decision accepted for implementation — do not re-open |

### Locked decisions (implementation defaults)

These are **required** for the Cryptita Plays implementation.

| Topic | Locked choice |
| ----- | ------------- |
| Page layout | **No-scroll homepage:** `100dvh`, `overflow: hidden`. Translucent header (`cryptita long.svg`) + HTML/CSS builder card + footer over a full-viewport **MoltenMetal** background. |
| Visual source | Adopt `index.html` + `style.css` as the React **ProfileCard** (front + back, click-to-flip). MoltenMetal from `molten-metal.md` (`ogl` + `MoltenMetal.css`). Card CSS is separate from MoltenMetal CSS. |
| On-chain writes | **CLI + IDE only.** `sui client publish` and `sui client call create_builder_card`. **No** Connect Wallet, **no** create form, **no** `@mysten/dapp-kit`, **no** browser PTB. |
| On-chain reads | **`@mysten/sui` read client only** (`getObject`). Default: no wallet kit unless a future official client requires it for reads. |
| On-chain struct | **`BuilderCard`** owned object. Fields: `builder_name`, `builder_no`, `profession`, `program`, `country`, `specialization`, `building_since`, `focus`, `community`, `skills`, `issued`, `about`, `photo_url`. **Dropped:** `course`, `school`, `linkedin_url`, `github_url`. |
| Photo | **`photo_url` string on-chain** (URL the frontend loads). Not `public/profile.png` as source of truth. |
| About | Stored on-chain in `about`, **not rendered** on the card UI. |
| Skills | **One comma-separated `String` on-chain;** frontend splits, trims, and renders chips. |
| Card back + flip | **Keep.** Partner SVGs are fixed workshop assets in `web/public/assets/`. |
| Footer socials | [Cryptita Facebook](https://www.facebook.com/cryptitaplays), [Cryptita LinkedIn](https://www.linkedin.com/company/cryptitaplays/). |
| Card sizing | Aspect **1.56 / 1**, cap ~**1020px** (`.page-shell` design size). Smaller viewports: scale the **whole card** via `transform: scale` (no chip/type reflow). Larger viewports: **do not grow** past design size. Counter browser zoom via **`visualViewport`**. Header/footer occupy the leftover vertical band. |
| Object ID / owner / network | **Not Move fields.** Package ID from `sui client publish`; Object ID from `sui client call create_builder_card`; `VITE_PORTFOLIO_OBJECT_ID` = that Object ID; frontend `getObject` → `content.fields` + `owner` + `id`; `VITE_SUI_NETWORK` → display label (e.g. `"Sui Mainnet"`). Site can build with **empty** object ID (empty/error card). |
| Brand | Wordmark “Cryptita Plays” + workshop card chrome. Header uses `cryptita long.svg`. |
| Networks | App **defaults to Mainnet** (`VITE_SUI_NETWORK=mainnet` or human label). No in-app network switcher. Testnet is README-only for practice. |
| Hosting | **Vercel**, root directory `web/`, `npm run build`. No custom domain required. |
| Package manager | **npm** |
| Styling | **Plain CSS** for card + layout; **MoltenMetal.css** for background shader. No Tailwind, no PostCSS stack. |
| Move Display / Publisher | **Omit.** No `init` Display objects. |
| Gas-coin tool | **Do not ship** a `tools/` script in v1. README: if CLI has no gas coin, follow **current** Sui docs. |
| Explorer | **Suiscan** Mainnet object URLs (OBJECT ID control on card may link out). |
| Sui SDK versions | Pin whatever official Sui docs recommend **on scaffold day** via `getFullnodeUrl('mainnet')`. |

---

## 1. Purpose

This workshop teaches beginners to go from a **Move smart contract** to a **live read-only Web3 homepage** on **Sui Mainnet**. `[USER REQUIREMENT]`

The deliverable is a **no-scroll builder card homepage**: a translucent header, a flip-enabled profile card whose fields come from an on-chain `BuilderCard` object, and a quiet footer— all over an animated MoltenMetal background. Participants **publish** and **create** their object with the Sui CLI, paste the resulting Object ID into env, and deploy a static site that **reads** chain data. There is no wallet connection or in-browser transaction in v1. `[LOCKED]`

The original repository was a multi-section portfolio with wallet scaffolding that never completed an on-chain write from the browser. This version **simplifies** the loop to match the card prototype and CLI-only writes while still demonstrating verifiable on-chain credentials on the card face. `[REPOSITORY]` `[USER REQUIREMENT]`

---

## 2. Context

| Item | Value |
| ---- | ----- |
| Organization | Cryptita Plays `[USER REQUIREMENT]` |
| Workshop title | Smart Contract to Website: Build & Deploy `[USER REQUIREMENT]` |
| Progression | Publish → Create (CLI) → Configure → Deploy → Verify on card `[LOCKED]` |
| Audience | Students, developers, aspiring Web3 builders, blockchain beginners `[USER REQUIREMENT]` |
| Production chain | Sui Mainnet `[USER REQUIREMENT]` `[REPOSITORY]` |
| UI reference | `index.html`, `style.css`, `molten-metal.md` `[REPOSITORY]` |

**Original project elements to replace** (do not copy): `[REMOVE]`

- Organization names: DEVCON, DEVCON Philippines, Sui Foundation co-branding copy
- Titles such as “DEVCON x Sui Move Smart Contracts Code Camp”
- Personal identity baked into the sample as production fallback
- Sample repo/demo URLs (`ldcasilang` GitHub, Vercel demo named after the original camp)
- Logos/assets used as **camp identity** (Sui may appear as technology on the card back, not as partner brand lockup on the front)
- Footer “Proof of Learning” attribution naming original organizers (rewrite for Cryptita Plays workshop consent copy)
- Package/npm names derived from the original camp
- Display-object template strings that name the original camp `[REPOSITORY]`
- Wallet connect UI, create form, Learn/Hero/About sections as primary UX `[LOCKED]` `[REMOVE]`

---

## 3. What the application does (target behavior)

1. Participant publishes a Move package containing `create_builder_card` to Sui (workshop: Mainnet). `[LOCKED]`
2. Participant calls `create_builder_card` **via Sui CLI** with string args matching the struct fields (except runtime-derived id/owner/network). `[LOCKED]`
3. CLI returns a **created Object ID**. Participant sets `VITE_PORTFOLIO_OBJECT_ID` (and package/network env as documented in `06`). `[LOCKED]`
4. Frontend builds as a **single-viewport** homepage: MoltenMetal background, header, scaled ProfileCard, footer. **No page scroll.** `[LOCKED]`
5. Frontend fetches the object with `@mysten/sui` **`getObject`**, maps fields to the card, and derives **NETWORK**, **OBJECT ID**, and **OWNER** from the response + config—not from Move fields. `[LOCKED]`
6. Profile **photo** renders from on-chain **`photo_url`**. `[LOCKED]`
7. **`about`** is stored on-chain but **not shown** on the card. `[LOCKED]`
8. **Skills** render as chips after splitting the on-chain comma-separated string. `[LOCKED]`
9. Card **flips** on click/tap to show partner logos on the back (fixed assets). `[LOCKED]`
10. If object ID is missing or fetch fails, the card shows **empty/error state**—no fake identity fallback. `[RECOMMENDATION]`
11. Footer links to Cryptita Facebook and LinkedIn; includes compressed “Proof of Learning & Building” workshop copy. `[LOCKED]`

---

## 4. Learning outcomes (new workshop)

After completing the workshop, a participant should be able to: `[USER REQUIREMENT]` `[LOCKED]`

1. Explain briefly: Sui, smart contracts, Move, object ownership, and how a static site reads on-chain data.
2. Build and **publish** a Move package (`sui move build`, `sui client publish`) and record the **Package ID**.
3. **Create** a `BuilderCard` object with **`sui client call`**, passing the workshop field list, and record the **Object ID**.
4. Configure the frontend env (`VITE_PORTFOLIO_OBJECT_ID`, `VITE_SUI_NETWORK`, package id as needed) and **rebuild** so Vite inlines values.
5. See on-chain fields rendered on the builder card (photo from `photo_url`, chips from `skills`, ISSUED from chain, id/owner/network from `getObject`).
6. Open the object in a public explorer (e.g. Suiscan) from the card or README.
7. Build and **deploy** the static frontend (e.g. Vercel, `web/` root).

**Dropped outcomes:** connect a browser wallet; submit a transaction from the website; use a website form as the primary create path. `[LOCKED]`

---

## 5. Core features (in scope)

| Feature | Source |
| ------- | ------ |
| No-scroll homepage (`100dvh`, header + card + footer + MoltenMetal) | `[LOCKED]` `[REPOSITORY]` prototype |
| ProfileCard ported from `index.html` / `style.css` (front, back, flip) | `[LOCKED]` `[REPOSITORY]` |
| MoltenMetal full-viewport background (`ogl`, `MoltenMetal.css`) | `[LOCKED]` `molten-metal.md` |
| Move package with `BuilderCard` owned object + `create_builder_card` | `[LOCKED]` `[REPOSITORY]` (evolved schema) |
| CLI-only object creation | `[LOCKED]` |
| Frontend read via `getObject` on configured Object ID | `[REPOSITORY]` `[LOCKED]` |
| Runtime display of NETWORK, OBJECT ID, OWNER (truncated + copy) | `[LOCKED]` `[REPOSITORY]` card bottom |
| ISSUED field from on-chain `issued` | `[LOCKED]` |
| Skills as chips from comma-separated `skills` string | `[REPOSITORY]` `[LOCKED]` |
| `photo_url` loaded as profile image | `[LOCKED]` |
| `about` stored on-chain, omitted from UI | `[LOCKED]` |
| Partner SVGs on card back (`web/public/assets/`) | `[LOCKED]` |
| Footer Facebook + LinkedIn + workshop consent blurb | `[LOCKED]` |
| Card scale rules (aspect 1.56/1, ~1020px cap, `visualViewport` zoom guard) | `[LOCKED]` |
| Static hosting on Vercel (`web/` root) | `[LOCKED]` |
| Configurable package ID + object ID via env | `[REPOSITORY]` `[LOCKED]` |
| Empty/error card when ID missing or fetch fails | `[RECOMMENDATION]` |

---

## 6. Explicitly excluded

| Item | Reason |
| ---- | ------ |
| Connect Wallet / wallet bar / `@mysten/dapp-kit` | Writes are CLI-only `[LOCKED]` |
| Create form / `useCreatePortfolio` / browser PTB | Writes are CLI-only `[LOCKED]` |
| Learn section, Hero, AboutSkills, multi-section portfolio scroll | Replaced by card homepage `[LOCKED]` |
| On-page educational essay as primary IA | Workshop README + verbal teaching; not a scrolling LMS `[USER REQUIREMENT]` |
| `linkedin_url`, `github_url`, `course`, `school` on-chain or on card | Dropped from schema `[LOCKED]` |
| `public/profile.png` as on-chain substitute | Photo source is `photo_url` `[LOCKED]` |
| Rendering `about` on the card | Stored only for future use / explorer `[LOCKED]` |
| Backend, database, auth, CMS | Not needed `[REPOSITORY]` |
| Multi-page site / router | Single viewport `[LOCKED]` |
| On-chain image bytes (Walrus, etc.) | URL string only in v1 `[LOCKED]` |
| Level 2 admin dashboard / CMS | Out of scope `[REMOVE]` |
| Hardcoded sample identity as production fallback | Hides fetch failures `[REMOVE]` |
| Pixel-perfect clone of original camp site | New card + MoltenMetal identity `[USER REQUIREMENT]` |
| SUI balance in header | No wallet UI in v1 `[LOCKED]` |
| In-app network switcher | Mainnet default `[LOCKED]` |
| Move Display / Publisher in `init` | Omitted `[LOCKED]` |

---

## 7. User journey

```text
Learn (README + facilitator)
    → Deploy Move package (CLI) → Package ID
    → Create BuilderCard object (CLI) → Object ID
    → Paste Object ID into .env / IDE (VITE_PORTFOLIO_OBJECT_ID)
    → npm run build → read-only site shows on-chain fields on the card
    → Deploy static site on Vercel
    → Verify on Suiscan (object link from card or README)
```

`[LOCKED]` CLI is the **only** write path. The website never signs transactions. Rebuild/redeploy after env changes so Vite inlines `VITE_*`. `[LOCKED]`

---

## 8. Functional requirements

### Layout and chrome

1. **FR-01** App loads as a static SPA with no server-side rendering. `[REPOSITORY]`
2. **FR-02** Root layout is exactly one viewport tall (`100dvh`), `overflow: hidden`, no document scroll. `[LOCKED]`
3. **FR-03** MoltenMetal renders fixed, full viewport, behind chrome; pointer-events per `molten-metal.md` / implementation spec. `[LOCKED]`
4. **FR-04** Header shows `cryptita long.svg` (or equivalent wordmark), translucent (~0.4–0.55 opacity), clickable if linked, in the top band. `[LOCKED]`
5. **FR-05** Footer is translucent, bottom band: two centered buttons (Facebook, LinkedIn URLs locked above) + small “Proof of Learning & Building” copy. `[LOCKED]`

### Card UI

6. **FR-06** ProfileCard markup and styling derive from `index.html` / `style.css`: front face fields, credential row, back face partners, click-to-flip. `[LOCKED]`
7. **FR-07** Card maintains aspect ratio **1.56 / 1** and internal proportions at design size (~1020px max width). `[LOCKED]`
8. **FR-08** On viewports smaller than design size, the entire card scales with `transform: scale` so typography and chips do not reflow independently. `[LOCKED]`
9. **FR-09** On viewports larger than design size, the card does **not** grow beyond the design cap. `[LOCKED]`
10. **FR-10** Browser zoom changes are compensated via `visualViewport` so on-screen card size stays stable relative to the layout intent. `[LOCKED]`
11. **FR-11** Header and footer occupy vertical space outside the scaled card shell (leftover band above/below). `[LOCKED]`

### Move package and CLI

12. **FR-12** Participant can publish the Move package with Sui CLI. `[REPOSITORY]`
13. **FR-13** `create_builder_card` accepts string arguments: `builder_name`, `builder_no`, `profession`, `program`, `country`, `specialization`, `building_since`, `focus`, `community`, `skills`, `issued`, `about`, `photo_url`, plus `&mut TxContext`; transfers the new `BuilderCard` to the sender. `[LOCKED]`
14. **FR-14** Created object is **owned** by the transaction sender. `[REPOSITORY]`
15. **FR-15** README documents the full `sui client call --args` list matching FR-13. `[LOCKED]`

### Read path and field mapping

16. **FR-16** Frontend reads the object at `VITE_PORTFOLIO_OBJECT_ID` via `getObject`. `[LOCKED]`
17. **FR-17** When the object ID is valid, the card displays: `builder_name`, `builder_no`, `profession`, `program`, `country`, `specialization`, `building_since`, `focus`, `community`, `skills` (as chips), `issued`, and image from `photo_url`. `[LOCKED]`
18. **FR-18** `about` is **not** present in the card DOM when data loads successfully. `[LOCKED]`
19. **FR-19** **NETWORK** label comes from `VITE_SUI_NETWORK` (or mapped display string). **OBJECT ID** and **OWNER** come from `getObject` response (`id`, `owner`), truncated in UI with copy buttons. `[LOCKED]`
20. **FR-20** Skills: split `skills` on commas, trim whitespace, render each segment as a chip; tolerate extra spaces (e.g. `"A, B, C"`). `[LOCKED]`
21. **FR-21** Loading and fetch-error states are visible on the card; **no** hardcoded person fallback. `[RECOMMENDATION]`
22. **FR-22** Build succeeds with **empty** `VITE_PORTFOLIO_OBJECT_ID`; runtime shows empty/error card state. `[LOCKED]`
23. **FR-23** OBJECT ID control may link to Suiscan Mainnet object URL. `[LOCKED]` `[REPOSITORY]`

### Workshop ops

24. **FR-24** Workshop docs cover: GitHub + static host, Sui CLI, Node, Mainnet gas, publish → create → env → build → deploy. No wallet-on-hosted-origin requirement. `[LOCKED]`

---

## 9. Non-functional requirements

- Beginner-readable code and folder layout (`Header`, `Footer`, `ProfileCard`, `MoltenMetal`). `[USER REQUIREMENT]`
- Understandable in a workshop session; minimize abstractions. `[USER REQUIREMENT]`
- Responsive **viewport fitting** via scale, not reflowing card innards. `[LOCKED]`
- No secrets in the repo; object/package IDs are public on-chain identifiers. `[REPOSITORY]`
- Prefer current official `@mysten/sui` client at implementation time. `[USER REQUIREMENT]`
- Respect `prefers-reduced-motion` for MoltenMetal where feasible. `[RECOMMENDATION]`

---

## 10. Simplification report

| Existing / prior spec feature | Keep / Simplify / Remove | Reason |
| ----------------------------- | ------------------------ | ------ |
| Multi-section scrolling portfolio | **Remove** | Card homepage only `[LOCKED]` |
| Wallet connect + in-app create | **Remove** | CLI-only writes `[LOCKED]` |
| `@mysten/dapp-kit` | **Remove** | Read client only `[LOCKED]` |
| `create_portfolio` + old field set | **Replace** | `BuilderCard` + new fields `[LOCKED]` |
| CLI `create_*` as README backup | **Promote** | CLI is primary write path `[LOCKED]` |
| Static `profile.png` as data source | **Remove** | `photo_url` on-chain `[LOCKED]` |
| Publisher + Display in `init` | **Remove** | Not required `[LOCKED]` |
| CLI publish | **Keep** | Package ID `[REPOSITORY]` |
| Raw `fetch` JSON-RPC | **Replace** | `@mysten/sui` `getObject` `[RECOMMENDATION]` |
| Tailwind + large utility CSS | **Remove** | Plain CSS + MoltenMetal.css `[LOCKED]` |
| Font Awesome CDN | **Remove** | Text/icon minimal UI `[LOCKED]` |
| Google Fonts Inter | **Optional** | Prototype uses Inter; system stack acceptable `[RECOMMENDATION]` |
| `react-toastify` | **Remove** | Unused `[REMOVE]` |
| `gh-pages` | **Remove** | Vercel `[LOCKED]` |
| Hardcoded default portfolio person | **Remove** | Empty/error states `[REMOVE]` |
| Learn / Hero / AboutSkills sections | **Remove** | Not in card IA `[LOCKED]` |
| Move tests | **Add minimal** | Original had none `[RECOMMENDATION]` |
| `create_builder_card` as `public fun` (not `entry`) | **Keep** | CLI callable `[LOCKED]` |

---

## 11. Known uncertainties

| ID | Item | Status |
| -- | ---- | ------ |
| U-01 | Official Cryptita Plays logo / hex / type beyond `cryptita long.svg` | **Deferred.** Card chrome is source of truth. `[LOCKED]` |
| U-02 | Exact `@mysten/sui` version | Pin from official Sui docs on scaffold day. `[LOCKED]` |
| U-03 | PublicNode JSON-RPC URLs | Do not copy. Use `getFullnodeUrl('mainnet')`. `[LOCKED]` |
| U-04 | CLI gas-coin / address balance | README points at current Sui docs if publish fails. `[LOCKED]` |
| U-05 | Partner link URLs on card back | Placeholder `#` in prototype; lock real URLs in `03` if provided. `[UNKNOWN]` |
| U-06 | Env rename `VITE_PORTFOLIO_OBJECT_ID` → `VITE_BUILDER_CARD_OBJECT_ID` | **Keep** `VITE_PORTFOLIO_OBJECT_ID` for workshop materials unless all specs migrate together. `[LOCKED]` |
| U-07 | Hosting | Vercel, `web/` root. `[LOCKED]` |
| U-08 | Invalid / broken `photo_url` | Show broken-image or placeholder state on card; do not fall back to another person’s photo. `[RECOMMENDATION]` |

---

## 12. Quality check mapping

| Question | Answer |
| -------- | ------ |
| What is the app? | Read-only Cryptita Plays builder-card homepage over MoltenMetal |
| Who is it for? | Workshop beginners |
| What does the user do? | Publish Move, CLI-create `BuilderCard`, set env, deploy static site |
| Frontend? | Static React SPA: `getObject` only, no wallet |
| Contract? | Owned `BuilderCard` + `create_builder_card` |
| Wallet? | **None in v1** |
| Transaction? | **CLI only** (`sui client call`) |
| Data from Sui? | Object fields + derived id/owner; network from env label |
| Photo? | `photo_url` string |
| About? | On-chain, not on card |
| Remove? | Wallet UI, create form, Learn scroll site, old social/school fields |
| Redesign? | Card prototype + MoltenMetal + translucent chrome |
| Deploy contract? | `sui move build` + `sui client publish` on Mainnet |
| Deploy frontend? | `npm run build` → Vercel, root `web/` |
| Verify? | See `07-testing-and-verification-spec.md` |
