# 02 — Architecture Specification

Workshop site: a **no-scroll, read-only** card homepage over a WebGL background. On-chain data is created via **Sui CLI + IDE only**; the browser never signs transactions.

> **Struct name:** **`BuilderCard`** / `create_builder_card` — canonical in `01` and `04`. Env key **`VITE_PORTFOLIO_OBJECT_ID`** holds the created Object ID (workshop continuity).

---

## 1. Repository shape

Keep the **two-layer, no-backend** layout. `[LOCKED]`

```text
cryptita-plays-smart-contract-to-website/
├── move/                              # Move package
│   ├── Move.toml
│   └── sources/
│       └── builder_card.move          # one module is enough
├── web/                               # Vite + React + TypeScript
│   ├── public/
│   │   └── assets/                    # cryptita long.svg, partner logos, sui-logo.svg
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── config.ts
│   │   ├── components/
│   │   │   ├── MoltenMetal.tsx
│   │   │   ├── MoltenMetal.css
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── ProfileCard.tsx
│   │   ├── hooks/
│   │   │   └── usePortfolio.ts        # read-only; name kept for workshop continuity
│   │   ├── lib/
│   │   │   ├── suiClient.ts
│   │   │   └── mapBuilderCard.ts
│   │   ├── styles/
│   │   │   ├── global.css             # 100dvh shell, header/footer chrome
│   │   │   └── profile-card.css       # ported from root style.css (no body bg)
│   │   └── types.ts
│   └── package.json
├── README.md                          # workshop guide (written at implementation time)
└── spec/
```

Do **not** add a `tools/` gas-coin folder, backend API, or wallet-provider layer in v1. `[LOCKED]`

Root `package.json` stays name-only (`private: true`) — no workspace scripts unless the workshop explicitly wants a monorepo. `[RECOMMENDATION]`

---

## 2. System diagram

```text
Participant (CLI + IDE)
    │
    ├─ sui client publish
    │       └─► Package ID  →  README / notes (not required in browser env)
    │
    ├─ sui client call create_builder_card --args …
    │       └─► Created Object ID  →  VITE_PORTFOLIO_OBJECT_ID in .env
    │
    └─ vite build / deploy static site
            └─► Hosted read-only frontend

Browser (read-only)
    │
    ▼
Static frontend (Vite/React, 100dvh, no scroll)
    │
    ├─ MoltenMetal (full viewport, decorative)
    ├─ Header / Footer (translucent chrome)
    └─ ProfileCard (scaled, click-to-flip)
            │
            ▼
        @mysten/sui SuiClient.getObject
            │
            ▼
        Sui fullnode (mainnet or testnet per VITE_SUI_NETWORK)
            │
            ▼
        Owned BuilderCard object
            content.fields  +  objectId  +  owner
```

**No browser write path.** There is no Connect Wallet, no PTB builder, no `signAndExecuteTransaction`, and no create form on the hosted site. `[LOCKED]`

---

## 3. Page composition diagram

Single route, single viewport. Nothing scrolls; the card scales inside the remaining vertical band.

```text
┌─────────────────────────────────────────────────────────────┐
│  App (height: 100dvh; overflow: hidden; position: relative) │
│                                                             │
│  ┌─ MoltenMetal ─────────────────────────────────────────┐  │
│  │ fixed inset-0; pointer-events per MoltenMetal source  │  │
│  │ (canvas may receive mouse for drift; card above)      │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─ Header (absolute top, ~opacity 0.4–0.55) ───────────┐  │
│  │ cryptita long.svg (centered / workshop chrome)         │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─ main (flex center; card scale + visualViewport) ────┐  │
│  │  ProfileCard                                           │  │
│  │    card-front  ← on-chain fields + derived credentials │  │
│  │    card-back   ← fixed workshop assets (partners)      │  │
│  │    click-to-flip (ignore a, button); copy on OBJECT ID│  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─ Footer (absolute bottom, ~opacity 0.4–0.55) ────────┐  │
│  │ [Facebook] [LinkedIn]  (Cryptita workshop URLs)        │  │
│  │ "Proof of Learning & Building" consent block           │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Removed from architecture (do not scaffold):** `WalletBar`, `Hero`, `AboutSkills`, `Learn`, `CreateForm`, Proof-as-a-full-section, wallet providers, `useCreatePortfolio`, dapp-kit, TanStack Query (unless a future read client mandates it). `[LOCKED]`

---

## 4. Frontend component wiring

```text
index.html
  → main.tsx
       → App.tsx
            ├─ MoltenMetal.tsx          # ogl WebGL background
            ├─ Header.tsx               # translucent top chrome
            ├─ main
            │    └─ ProfileCard.tsx     # markup from index.html; flip + copy behavior
            └─ Footer.tsx               # social links + proof copy

ProfileCard.tsx
  └─ usePortfolio()                     # read-only hook
       ├─ config: VITE_PORTFOLIO_OBJECT_ID, VITE_SUI_NETWORK
       ├─ suiClient.getObject({ showContent, showOwner })
       └─ mapBuilderCard(fields, objectId, owner, networkLabel)
```

### Component responsibilities

| Component | Responsibility |
| --------- | -------------- |
| **MoltenMetal** | Full-viewport animated background (`ogl` + `MoltenMetal.css`). Replaces `body` background from original `style.css`. Pointer-events follow the React Bits source (canvas may handle mouse drift). |
| **Header** | Low-opacity workshop chrome; `cryptita long.svg` from `public/assets/`. Does not compete with the card. |
| **ProfileCard** | Port of `index.html` structure and `style.css` rules. Front face binds on-chain + derived fields. Back face uses fixed partner SVGs. Click toggles `is-flipped` except on `a` / `button`. Copy buttons on OBJECT ID and OWNER. OBJECT ID control links to Suiscan. |
| **Footer** | Facebook + LinkedIn buttons (Cryptita URLs). Small "Proof of Learning & Building" block. |
| **usePortfolio** | Fetches object when `VITE_PORTFOLIO_OBJECT_ID` is set; maps fields; exposes loading / empty / error. No writes. |
| **config.ts** | Reads `import.meta.env.VITE_*`; formats network display label. |

### State and routing

- **State:** local React state in `usePortfolio` and `ProfileCard` (flip, copy feedback). No Redux, Zustand, or wallet context. `[LOCKED]`
- **Routing:** none — one homepage. `[LOCKED]`

### Card sizing (architectural constraint)

- Design size cap ~1020px width (from `.page-shell` in source CSS); aspect ratio **1.56 : 1**.
- Smaller viewports: scale the **entire card** with `transform: scale()` so typography and chips do not reflow.
- Larger viewports: do **not** grow past design size.
- Counter browser zoom via `visualViewport` so on-screen card size stays stable.
- Header and footer occupy the leftover vertical band; they do not scroll.

---

## 5. Smart-contract architecture

One package, one module, one owned struct. `[LOCKED]`

```text
Package (published once via CLI)
  Module builder_card
    (no init Display / Publisher)           ← omitted [LOCKED]
    create_builder_card(...)                ← creates owned BuilderCard; transfer to sender
    BuilderCard {
      id,
      builder_name,
      builder_no,
      profession,
      program,
      country,
      specialization,
      building_since,
      focus,
      community,
      skills,          // single comma-separated String
      issued,
      about,           // stored on-chain; NOT rendered on card
      photo_url
    }
```

| Property | Value |
| -------- | ----- |
| Abilities | `key, store` |
| Ownership | `transfer::transfer(card, sender)` — **not** shared |
| Events | none in v1 |
| Updates / burn | none in v1 — site is a reader after create |

Full Move signatures, CLI `--args` order, and tests live in `04-sui-and-smart-contract-spec.md`.

### Runtime-derived vs on-chain fields

These appear on the card but are **not** Move struct fields:

| UI label | Source |
| -------- | ------ |
| **NETWORK** | `VITE_SUI_NETWORK` → display string (e.g. `"Sui Mainnet"`) |
| **OBJECT ID** | `getObject` response `objectId` (truncated in UI; full value for copy + Suiscan) |
| **OWNER** | `getObject` response `owner` (AddressOwner or equivalent; truncated + copy) |

**ISSUED** is on-chain (`issued` field). All other front-face identity fields map 1:1 from `content.fields`.

**`about`** is fetched and may be typed in the client, but must **not** be rendered in the DOM. `[LOCKED]`

**`skills`** is one on-chain string; frontend splits on commas, trims, renders chips (e.g. `"A, B,C"` → three chips).

**`photo_url`** is the image `src` for the profile photo (not `public/profile.png` as source of truth).

---

## 6. Data flow — read-only

```text
.env (build time)
  VITE_PORTFOLIO_OBJECT_ID=0x…     # may be empty before first CLI create
  VITE_SUI_NETWORK=mainnet         # drives NETWORK label + RPC endpoint

App mount
  → usePortfolio()
       │
       ├─ if OBJECT_ID empty
       │     └─ status: empty → ProfileCard shows empty state (no fake identity)
       │
       └─ if OBJECT_ID set
             └─ suiClient.getObject({
                  id: VITE_PORTFOLIO_OBJECT_ID,
                  options: { showContent: true, showOwner: true }
                })
                  │
                  ├─ success
                  │     ├─ content.fields → mapBuilderCard()
                  │     ├─ objectId       → OBJECT ID row + Suiscan href
                  │     ├─ owner          → OWNER row
                  │     └─ network label  → from VITE_SUI_NETWORK
                  │
                  └─ failure / wrong type
                        └─ status: error → ProfileCard shows error state (no hardcoded person)
```

### Field mapping (on-chain → card front)

| Move field (`content.fields`) | Card region |
| ----------------------------- | ----------- |
| `builder_name` | Identity header (BUILDER) |
| `builder_no` | BUILDER NO. |
| `profession` | PROFESSION |
| `program` | PROGRAM |
| `country` | COUNTRY |
| `specialization` | SPECIALIZATION |
| `building_since` | BUILDING SINCE |
| `focus` | FOCUS |
| `community` | COMMUNITY |
| `skills` | SKILLS (split → chips) |
| `issued` | ISSUED |
| `photo_url` | Profile photo `<img src>` |
| `about` | *(not rendered)* |

### Workshop config loop (CLI → env → rebuild)

```text
sui client publish
  → Package ID (document in README; optional VITE_PACKAGE_ID for docs only)

sui client call create_builder_card --package <id> --args …
  → Created Object ID

participant sets VITE_PORTFOLIO_OBJECT_ID in .env / IDE

vite build (or dev server restart)
  → static site shows populated card

deploy
  → hosted origin is read-only; no wallet on origin required
```

IDs are public on-chain; only `VITE_*` vars are exposed to the browser bundle. Do not commit CLI keystore material. `[LOCKED]`

---

## 7. Dependency strategy

### Require

| Dependency | Role |
| ---------- | ---- |
| `react`, `react-dom` | UI |
| `vite`, `@vitejs/plugin-react`, `typescript` | Build |
| `@mysten/sui` | `SuiClient` + `getObject` only (read client) |
| `ogl` | MoltenMetal WebGL renderer |

### Do not add (v1)

| Removed | Reason |
| ------- | ------ |
| `@mysten/dapp-kit`, wallet adapters | No browser writes |
| `@tanstack/react-query` | Not needed without dapp-kit |
| `useCreatePortfolio`, PTB helpers | CLI-only create |
| `react-toastify`, `gh-pages` | Out of workshop scope |
| axios, react-router, UI kits, analytics, i18n, global state libs | Unnecessary surface |

### Styling

- `profile-card.css` — card markup from root `index.html` / `style.css` (minus page `body` background).
- `MoltenMetal.css` — container sizing from React Bits.
- `global.css` — `100dvh` shell, header/footer positioning, opacity.
- No Tailwind. `[LOCKED]`

### Move.toml

Pin Sui framework to the **current** `sui move` / official docs revision at implementation time (do not assume an old git `rev`). `[RECOMMENDATION]`

---

## 8. Configuration

```text
# .env (participant-local; not committed with secrets)
VITE_SUI_NETWORK=mainnet
VITE_PORTFOLIO_OBJECT_ID=0x...    # empty until after create_builder_card
```

| Variable | Used for |
| -------- | -------- |
| `VITE_PORTFOLIO_OBJECT_ID` | `getObject` target; empty → empty card state |
| `VITE_SUI_NETWORK` | RPC network selection + NETWORK label on card |

`VITE_PACKAGE_ID` is optional for documentation/debug; the read-only homepage does not need it to render an existing object. Package ID is still required for the CLI `create_builder_card` call.

---

## 9. Diagram index

| # | Diagram | Section |
| - | ------- | ------- |
| 1 | Repository tree | §1 |
| 2 | System diagram (CLI create + read-only browser) | §2 |
| 3 | Page composition (App layers) | §3 |
| 4 | Frontend component wiring | §4 |
| 5 | Smart-contract module / struct | §5 |
| 6 | Read-only data flow | §6 |
| 7 | Field mapping table | §6 |
| 8 | Workshop config loop (publish → create → env → build) | §6 |

---

## 10. What not to introduce

- Browser wallet connect, create form, or transaction signing
- Shared objects, admin capabilities, or on-chain update/delete in v1
- Indexer / GraphQL unless `getObject` on the chosen network **requires** it — prefer direct `getObject` first `[LOCKED]`
- Backend to store object IDs or serve RPC
- Scrollable multi-section marketing page (old Hero / Learn / About layout)
- CI/CD beyond what the static host provides (no GitHub Actions required in v1) `[RECOMMENDATION]`
