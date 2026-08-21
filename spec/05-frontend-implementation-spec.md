# 05 — Frontend Implementation Specification

Implement a **new** read-only SPA under `web/`. Port visual structure from repository root [`index.html`](../index.html) and [`style.css`](../style.css); port the background shader from [`molten-metal.md`](../molten-metal.md). Align with `01`–`04` — **CLI-only writes**, **no wallet**, **no create form**.

Source labels:

| Label | Meaning |
| ----- | ------- |
| `[LOCKED]` | Required decision — do not re-open |
| `[REPOSITORY]` | Verified in the card prototype at repo root |
| `[REMOVE]` | Present in older drafts or original camp repo — do not implement |
| `[RECOMMENDATION]` | Preferred but not blocking |

---

## 1. Purpose and scope

The frontend is a **single-viewport, read-only** homepage:

- Full-viewport **MoltenMetal** background (`ogl`)
- Translucent **Header** + **Footer** chrome
- Centered, scaled **ProfileCard** (front + back, click-to-flip)
- On-chain data from one `getObject` call against `VITE_PORTFOLIO_OBJECT_ID`

**In scope:** render `BuilderCard` fields, derived OBJECT ID / OWNER / NETWORK, copy buttons, Suiscan link, empty/error states.

**Out of scope:** Connect Wallet, create form, PTB, `useCreatePortfolio`, wallet providers, multi-section scroll site, `about` in the DOM. `[LOCKED]`

---

## 2. Stack

| Item | Choice |
| ---- | ------ |
| Language | TypeScript |
| UI | React 18+ (Vite React template) |
| Bundler | Vite — `dev` / `build` / `preview` |
| Entry | `index.html` → `src/main.tsx` |
| Package manager | **npm** `[LOCKED]` |
| Sui | `@mysten/sui` — **read client only** (`SuiClient.getObject`) |
| WebGL background | `ogl` — MoltenMetal `[LOCKED]` |
| CSS | Plain CSS files — **no Tailwind**, no PostCSS stack `[LOCKED]` |
| Routing | None — one homepage `[LOCKED]` |
| Global state | None — local React state only `[LOCKED]` |

Dev server: Vite default port **5173**, `host: true`. `[RECOMMENDATION]`

---

## 3. Dependencies

### Require

| Package | Role |
| ------- | ---- |
| `react`, `react-dom` | UI |
| `vite`, `@vitejs/plugin-react`, `typescript` | Build |
| `@mysten/sui` | `SuiClient` + `getObject` only |
| `ogl` | MoltenMetal WebGL renderer |

Pin `@mysten/sui` to the version recommended in official Sui docs on scaffold day. Use `getFullnodeUrl('mainnet')` (or current equivalent) in `suiClient.ts`.

### Do not add `[LOCKED]` `[REMOVE]`

| Package | Reason |
| ------- | ------ |
| `@mysten/dapp-kit`, wallet adapters | No browser writes |
| `@tanstack/react-query` | Not required for a single `getObject` on mount |
| `useCreatePortfolio`, PTB helpers | CLI-only create |
| `react-router-dom` | Single page |
| `react-toastify`, `gh-pages` | Out of scope |
| `axios` | Use SDK client only |
| Tailwind, UI kits, analytics, i18n, Redux/Zustand | Unnecessary surface |

**No backend.** `[LOCKED]`

---

## 4. File structure

```text
web/
├── public/
│   └── assets/                        # static SVGs only (see §12)
│       ├── cryptita-long.svg
│       ├── cryptita.svg
│       ├── sui-logo.svg
│       ├── devcon-laguna.svg          # normalize from prototype filenames
│       ├── aws-uphsl.svg
│       ├── grantix.svg
│       └── kamiyon.svg
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── src/
    ├── main.tsx                       # mount App only — no wallet providers
    ├── App.tsx                        # layout shell + card scale wrapper
    ├── config.ts                      # env + network label + explorer URLs
    ├── types.ts                       # BuilderCardFields, UsePortfolioResult
    ├── components/
    │   ├── MoltenMetal.tsx
    │   ├── MoltenMetal.css
    │   ├── Header.tsx
    │   ├── Footer.tsx
    │   └── ProfileCard.tsx
    ├── hooks/
    │   └── usePortfolio.ts            # read-only; name kept for workshop continuity
    ├── lib/
    │   ├── suiClient.ts               # singleton SuiClient
    │   └── mapBuilderCard.ts          # fields + derived credentials → view model
    └── styles/
        ├── global.css                 # 100dvh shell, header/footer, main stage
        └── profile-card.css           # ported from root style.css (card only)
```

**Do not scaffold:** `WalletBar`, `Hero`, `AboutSkills`, `Learn`, `CreateForm`, `Proof`, `useCreatePortfolio`, `public/profile.png` as data source. `[REMOVE]`

---

## 5. Configuration (`config.ts`)

Read build-time env via `import.meta.env`:

```text
VITE_SUI_NETWORK=mainnet          # or human label e.g. "Sui Mainnet"
VITE_PORTFOLIO_OBJECT_ID=         # created Object ID; may be empty before CLI create
VITE_PACKAGE_ID=                  # optional — README / debug only; not required to render
```

| Export | Source | Use |
| ------ | ------ | --- |
| `objectId` | `VITE_PORTFOLIO_OBJECT_ID` | `getObject` target; trim whitespace |
| `networkLabel` | `VITE_SUI_NETWORK` | Card **NETWORK** row — map `mainnet` → `"Sui Mainnet"` if needed |
| `rpcUrl` | derived from network | `getFullnodeUrl('mainnet')` for workshop default |
| `suiscanObjectUrl(id)` | helper | `https://suiscan.xyz/mainnet/object/{id}/fields` |

**Soft failure:** empty `objectId` is valid at build time; runtime shows empty card state — do not throw at import. `[LOCKED]`

`VITE_PACKAGE_ID` is never required for the read path. Document it in README for CLI `create_builder_card` examples only.

---

## 6. Sui read client (`lib/suiClient.ts`)

```typescript
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { rpcUrl } from '../config';

export const suiClient = new SuiClient({ url: rpcUrl ?? getFullnodeUrl('mainnet') });
```

**Single operation:** `getObject` with `options: { showContent: true, showOwner: true }`.

No `signAndExecuteTransaction`, no wallet context, no query client wrapper.

---

## 7. Types (`types.ts`)

```typescript
/** Raw on-chain string fields from content.fields */
export type BuilderCardFields = {
  builder_name: string;
  builder_no: string;
  profession: string;
  program: string;
  country: string;
  specialization: string;
  building_since: string;
  focus: string;
  community: string;
  skills: string;       // comma-separated; split in mapBuilderCard
  issued: string;
  about: string;        // typed but never rendered
  photo_url: string;
};

/** View model for ProfileCard */
export type BuilderCardView = {
  fields: BuilderCardFields;
  skills: string[];     // split + trimmed chips
  objectId: string;
  owner: string;        // normalized address string
  networkLabel: string;
};

export type PortfolioStatus = 'idle' | 'loading' | 'empty' | 'success' | 'error';

export type UsePortfolioResult = {
  status: PortfolioStatus;
  data: BuilderCardView | null;
  error: string | null;
};
```

Do **not** include `linkedin_url`, `github_url`, `course`, or `school`. `[LOCKED]`

---

## 8. Field mapper (`lib/mapBuilderCard.ts`)

Pure function — no side effects:

```text
mapBuilderCard(
  fields: Record<string, unknown>,   # from getObject content.fields
  objectId: string,
  owner: unknown,                    # normalize AddressOwner → 0x… string
  networkLabel: string
): BuilderCardView
```

### Responsibilities

1. Coerce each Move string field to `string` (default `''` if missing).
2. **Skills:** `skills.split(',').map(s => s.trim()).filter(Boolean)` → `skills: string[]`.
3. **Owner:** if `owner` is `{ AddressOwner: addr }`, use `addr`; else stringify safely.
4. Pass through `about` in the typed object but ProfileCard must **never** read it for DOM.
5. Do not invent fallback identity when fields are empty.

---

## 9. Hook — `usePortfolio` (`hooks/usePortfolio.ts`)

Read-only data hook. **Not** a write hook; **not** TanStack Query.

```text
Purpose:     Fetch BuilderCard once on mount when objectId is configured
Inputs:      config.objectId, config.networkLabel (module-level)
State:       status, data, error (useState + useEffect)
Blockchain:  suiClient.getObject({ id, options: { showContent: true, showOwner: true } })
Output:      UsePortfolioResult
```

### Status machine

| Condition | `status` | `data` |
| --------- | -------- | ------ |
| `objectId` empty / whitespace | `empty` | `null` |
| Fetch in flight | `loading` | `null` |
| `getObject` throws or missing `content.fields` | `error` | `null` |
| Success | `success` | `BuilderCardView` |

### Error handling

- Surface a short user-visible message on the card (e.g. "Could not load on-chain data").
- Log full error to `console.error` in dev.
- **No** hardcoded sample person (Sherwin, Alex, etc.). `[LOCKED]`

### Refetch

- No polling, no window-focus refetch in v1.
- Participant must rebuild/redeploy after env change (Vite inlines `VITE_*`). `[LOCKED]`

---

## 10. App shell (`App.tsx` + `main.tsx`)

### `main.tsx`

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

**No** `QueryClientProvider`, **no** `WalletProvider`, **no** dapp-kit CSS. `[LOCKED]`

### `App.tsx` composition

```text
<div className="app-root">           <!-- 100dvh, overflow hidden -->
  <MoltenMetal />                    <!-- fixed inset 0, z-index 0 -->
  <Header />
  <main className="card-stage">      <!-- flex center; hosts scale wrapper -->
    <div className="card-scale" ref> <!-- transform: scale(effectiveScale) -->
      <ProfileCard />
    </div>
  </main>
  <Footer />
</div>
```

`App` (or a small `useCardScale` helper colocated in `App.tsx`) owns **card scaling** logic (§11).

---

## 11. Card scaling and `visualViewport` `[LOCKED]`

Port sizing intent from `03-ui-ux-and-brand-spec.md` §5 and `.page-shell` in [`style.css`](../style.css).

### Design constants

| Constant | Value |
| -------- | ----- |
| Design width cap | **1020px** |
| Aspect ratio | **1.56 / 1** |
| Perspective | **1600px** on scale wrapper |
| Header/footer band reserve | ~48–64px each (fixed or measured) |

### Fit scale

```text
availableHeight = 100dvh - headerBand - footerBand
maxWidth        = min(1020, 89vw, availableHeight * 1.56)
fitScale        = min(1, maxWidth / 1020)
```

- **Smaller viewports:** apply `transform: scale(fitScale)` on `.card-scale`; `transform-origin: center center`.
- **Larger viewports:** `fitScale = 1`; card does **not** grow past 1020px design width.
- **Do not** use responsive `@media` rules that reflow card grids or change `aspect-ratio: auto` — omit tablet/mobile blocks from ported CSS. `[LOCKED]`

### Browser zoom compensation

Listen to `visualViewport` `resize` and `scroll`, plus `window` `resize`:

```text
effectiveScale = fitScale / (visualViewport?.scale ?? 1)
```

Apply `transform: scale(effectiveScale)` so Ctrl/Cmd +/- does not enlarge the on-screen card past the design cap.

### CSS note

Move `.page-shell` width logic into JS scale wrapper; keep inner `.profile-card` at design width (1020px max) inside the scaled container.

---

## 12. Static assets (`public/assets/`)

All workshop SVGs live under **`web/public/assets/`**. Reference with absolute paths from public root, e.g. `/assets/cryptita-long.svg`.

| File | Use |
| ---- | --- |
| `cryptita-long.svg` | Page header (`Header.tsx`) |
| `cryptita.svg` | Card deboss/emboss CSS masks in `profile-card.css` |
| `sui-logo.svg` | Front credential Sui box + back "Built on Sui" |
| `devcon-laguna.svg` | Card back partner row |
| `aws-uphsl.svg` | Card back partner row |
| `grantix.svg` | Card back partner row |
| `kamiyon.svg` | Card back partner row |

**Profile photo:** load from on-chain `photo_url` only. Do **not** ship `public/profile.png` as source of truth or workshop fallback identity. `[LOCKED]`

Normalize prototype filenames with spaces (e.g. `devcon laguna.svg`) to kebab-case in `public/assets/`.

---

## 13. CSS split

### `styles/global.css`

- `html`, `body`, `#root`, `.app-root`: `height: 100dvh`, `overflow: hidden`, `margin: 0`
- **No** `body` radial gradient from prototype — MoltenMetal is the background `[LOCKED]`
- `.card-stage`: flex center, `position: relative`, `z-index` above MoltenMetal
- `.card-scale`: `perspective: 1600px`, `transform` applied inline from JS
- Header/footer: `position: absolute`, full width, translucent background `rgba(0,0,0,0.45)` (~0.40–0.55 opacity band)
- System font stack: `Inter`, `ui-sans-serif`, system-ui, … (no Google Fonts CDN in v1)

### `styles/profile-card.css`

Port from root [`style.css`](../style.css):

- **Include:** card material, deboss/emboss, flip system, front/back faces, credential row, skills chips, copy buttons, partner strip
- **Exclude:** `body` background and centering grid; `@media` blocks that change grid columns, `aspect-ratio: auto`, `min-height`, or mobile reflow (§11 handles all viewports via scale)
- Update mask `url(...)` paths to `/assets/cryptita.svg`

### `components/MoltenMetal.css`

From [`molten-metal.md`](../molten-metal.md):

```css
.molten-metal-container {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
}
```

Component source: copy from `molten-metal.md` into `MoltenMetal.tsx` unchanged except default props and container class.

---

## 14. Component specifications

### 14.1 `MoltenMetal.tsx`

| | |
| - | - |
| **Purpose** | Full-viewport animated WebGL background |
| **Inputs** | Optional color/speed props; defaults from `molten-metal.md` |
| **State** | Internal refs only (renderer lifecycle) |
| **Blockchain** | None |
| **CSS** | `MoltenMetal.css` |
| **a11y** | Decorative; respect `prefers-reduced-motion` by pausing when tab hidden (built into source) |

Render as first child in `App` so it sits behind chrome.

### 14.2 `Header.tsx`

| | |
| - | - |
| **Purpose** | Translucent top band + linked Cryptita wordmark |
| **Inputs** | None |
| **Content** | `<img src="/assets/cryptita-long.svg" alt="Cryptita Plays" />` inside `<a href="https://www.facebook.com/cryptitaplays" target="_blank" rel="noopener noreferrer">` |
| **Blockchain** | None |
| **Wallet** | None `[REMOVE]` |

### 14.3 `Footer.tsx`

| | |
| - | - |
| **Purpose** | Social links + workshop consent copy |
| **Content** | Centered buttons: [Facebook](https://www.facebook.com/cryptitaplays), [LinkedIn](https://www.linkedin.com/company/cryptitaplays/) |
| **Proof block** | Heading: **Proof of Learning & Building** — body copy from `03` §8 |
| **Blockchain** | None — object id is on the card, not repeated here |

### 14.4 `ProfileCard.tsx`

| | |
| - | - |
| **Purpose** | Port of [`index.html`](../index.html) — front/back faces, field binding, flip, copy |
| **Inputs** | `usePortfolio()` result |
| **Local state** | `isFlipped`, copy feedback (`copiedField`), optional `--mx`/`--my` for material light |
| **Blockchain** | Indirect via hook only |

#### Markup

Preserve class names and DOM regions from the prototype:

- `.profile-card` container with `.card-side.card-front` and `.card-side.card-back`
- Static chrome: `CRYPTITA PLAYS`, `BUILDER WORKSHOP 2026` (not from chain)
- Front: builder fields, photo, skills chips, credential row
- Back: embossed logo, Built on Sui, partner SVGs from `/assets/`

#### Flip behavior

- Click toggles `is-flipped` on `.profile-card`
- **Ignore** clicks on `a` and `button` (`stopPropagation` on copy buttons)
- Back emboss animations run only while flipped; honor `prefers-reduced-motion`

#### Copy buttons

- Truncate display: `0x` + first 4–6 + `…` + last 4–6
- Copy **full** object id / owner address to clipboard
- Brief `✓` affordance ~900ms; silent fail if clipboard blocked

#### Suiscan

OBJECT ID text or adjacent control may link to `suiscanObjectUrl(objectId)`.

#### Document title

- Success: `` `${builder_name} · Cryptita Plays` ``
- Otherwise: `Cryptita Plays — Builder Workshop`

---

## 15. Field mapping (on-chain → card UI)

### Front face — Move fields

| Move field (`content.fields`) | Card UI label / region | Notes |
| ----------------------------- | ---------------------- | ----- |
| `builder_name` | BUILDER (`<h1>`) | `alt` on profile photo |
| `builder_no` | BUILDER NO. | |
| `profession` | PROFESSION | |
| `program` | PROGRAM | |
| `country` | COUNTRY | |
| `specialization` | SPECIALIZATION | |
| `building_since` | BUILDING SINCE | |
| `focus` | FOCUS | |
| `community` | COMMUNITY | |
| `skills` | SKILLS | Comma-separated string → chip `<span>`s |
| `photo_url` | Profile `<img src>` | Remote URL; not local asset |
| `about` | *(omitted)* | **Must not appear in DOM** `[LOCKED]` |

### Credential row

| Source | Card UI label | Rules |
| ------ | ------------- | ----- |
| `issued` (on-chain) | **ISSUED** | Display as stored (e.g. `08-08-26`, `August 2026`) |
| `VITE_SUI_NETWORK` → `networkLabel` | **NETWORK** | Human label at read time — **not** a Move field |
| `getObject` → `objectId` | **OBJECT ID** | Truncated display; full value for copy + Suiscan |
| `getObject` → `owner` | **OWNER** | Truncated display; full address for copy |
| Static asset | Sui logo box | Links to `https://www.sui.io/` |

### Back face

Fixed workshop assets only — not from chain. Partner `href` may be `#` until URLs are supplied.

### Skills parsing

```typescript
function parseSkills(raw: string): string[] {
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}
```

Example: `"Move, Sui, TypeScript, React"` → four chips. Tolerate extra spaces.

---

## 16. Empty, loading, and error states

| State | Trigger | UI behavior |
| ----- | ------- | ----------- |
| **Empty** | `VITE_PORTFOLIO_OBJECT_ID` empty | Placeholder field copy; credential row shows em dash / "Not configured"; no fake name |
| **Loading** | Fetch in flight | Subtle inline indicator or skeleton inside card frame |
| **Error** | RPC failure, wrong type, missing `content.fields` | Visible error message on card; fields stay placeholders |
| **Success** | Valid `BuilderCard` object | All mapped fields populated |
| **Broken photo** | Invalid `photo_url` | Neutral placeholder frame; `onError` on `<img>` — no stock portrait |

Placeholder copy example: *"Your builder name will appear here after the object loads."*

**Build must succeed** with empty `VITE_PORTFOLIO_OBJECT_ID`. `[LOCKED]`

There is **no** wallet state, transaction state, or form state. `[LOCKED]`

---

## 17. Explicit removals `[REMOVE]`

Do **not** implement, import, or document:

| Item | Replacement |
| ---- | ----------- |
| `@mysten/dapp-kit`, `WalletProvider` | None |
| `WalletBar`, connect/disconnect UI | None |
| `Hero`, `AboutSkills`, `Learn` sections | Single `ProfileCard` |
| `CreateForm`, `useCreatePortfolio` | CLI `sui client call create_builder_card` |
| `Proof` section component | Credential row on card |
| `@tanstack/react-query` | `useEffect` + `useState` in `usePortfolio` |
| `create_portfolio` / old field names | `BuilderCard` / `mapBuilderCard` |
| `linkedin_url`, `github_url` on card | Dropped from schema |
| `public/profile.png` as data source | `photo_url` on-chain |
| Rendering `about` | Stored on-chain only |
| Font Awesome CDN | Text/unicode copy icon (⧉) |
| Multi-page router | Single `App` |
| SUI balance in header | No wallet in v1 |

---

## 18. HTML shell (`index.html`)

- `lang="en"`
- Viewport meta for mobile
- `<div id="root"></div>` — no inline card markup
- Favicon: Cryptita Plays (not camp branding)
- `theme-color`: accent `#42a5ff` `[RECOMMENDATION]`
- No sample person meta author/keywords

---

## 19. External links (allowed)

| Target | Where |
| ------ | ----- |
| `https://www.sui.io/` | Sui logo boxes |
| `https://suiscan.xyz/mainnet/object/{id}/fields` | OBJECT ID |
| Cryptita Facebook / LinkedIn | Header (optional), Footer |
| Partner URLs on card back | When provided; `#` until then |

Forbidden: original camp GitHub sample, Vercel demo of prior workshop, organizer lockup URLs.

---

## 20. Accessibility (minimum)

- Semantic landmarks: `<header>`, `<main>`, `<footer>`
- Real `<button>` for copy; real `<a>` for external links
- `alt={builder_name}` when known; generic alt when empty
- Focus rings on interactive controls
- Respect `prefers-reduced-motion` for flip and back emboss
- Card flip is click-driven; ensure tab order reaches back-face links when flipped `[RECOMMENDATION]`

---

## 21. Implementation checklist

| Step | Task |
| ---- | ---- |
| 1 | Scaffold Vite React TS in `web/` |
| 2 | Add deps: `@mysten/sui`, `ogl` only (no wallet/query libs) |
| 3 | Copy assets to `public/assets/`; normalize filenames |
| 4 | Implement `config.ts`, `suiClient.ts`, `types.ts`, `mapBuilderCard.ts` |
| 5 | Implement `usePortfolio` with empty/loading/error/success |
| 6 | Port `MoltenMetal.tsx` + CSS |
| 7 | Split CSS: `global.css` + `profile-card.css` (no body bg, no reflow media queries) |
| 8 | Build `Header`, `Footer`, `ProfileCard` |
| 9 | Wire `App.tsx` with card scale + `visualViewport` |
| 10 | Verify field mapping, ISSUED, NETWORK, OBJECT ID, OWNER, skills chips, photo_url |
| 11 | Verify empty ID build + error path (no hardcoded identity) |
| 12 | Cross-check with `07-testing-and-verification-spec.md` |

---

## 22. Cross-references

| Topic | Document |
| ----- | -------- |
| Product scope, FRs, locked decisions | `01-project-spec.md` |
| Repo tree, system diagram, data flow | `02-architecture-spec.md` |
| Layout, scaling, brand, states | `03-ui-ux-and-brand-spec.md` |
| Move struct, CLI args, field list | `04-sui-and-smart-contract-spec.md` |
| Env vars, deploy | `06-deployment-and-environment-spec.md` |
| Manual verification | `07-testing-and-verification-spec.md` |

---

## 23. Quality gate (this spec)

| Question | Answer |
| -------- | ------ |
| Writes from browser? | **No** — CLI only |
| Wallet / dapp-kit? | **No** |
| Data fetch? | `usePortfolio` → `getObject` once |
| Create hook? | **Removed** |
| TanStack Query? | **Not used** |
| Card UI source? | `index.html` + `style.css` → `ProfileCard` + `profile-card.css` |
| Background? | `MoltenMetal` + `ogl` |
| Photo source? | `photo_url` on-chain |
| About on page? | **No** |
| Empty object ID? | Build OK; empty card at runtime |
