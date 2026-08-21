# 08 — Implementation Checklist

Build a **new** Cryptita Plays repo from this `/spec` package. Do not clone or copy the original camp source.

**Model:** CLI-only writes (`sui client publish`, `sui client call create_builder_card`) + **read-only** static frontend (`getObject` only). No Connect Wallet, no create form, no browser PTB, no `@mysten/dapp-kit`. `[LOCKED]`

Cross-references: struct and CLI arg order in `04`; frontend details in `05`; env and deploy in `06`; verification in `07`.

---

## Phase 1 — Scaffold

- [ ] Create frontend with Vite + React + TypeScript under `web/`
- [ ] Add plain CSS files (`global.css`, `profile-card.css`, `MoltenMetal.css`). **No Tailwind.** `[LOCKED]`
- [ ] Install `@mysten/sui` (read client only) and `ogl` (MoltenMetal). Pin versions from official Sui docs on scaffold day.
- [ ] **Do not** install `@mysten/dapp-kit`, wallet adapters, or `@tanstack/react-query`. `[LOCKED]`
- [ ] `main.tsx`: mount `App` only — **no** `WalletProvider`, **no** `QueryClientProvider`, **no** dapp-kit CSS. `[LOCKED]`
- [ ] `config.ts`: `VITE_SUI_NETWORK`, optional `VITE_PACKAGE_ID` (README/CLI only), `VITE_PORTFOLIO_OBJECT_ID` (created Object ID — not Package ID). `[LOCKED]`
- [ ] Cryptita Plays title in `index.html` (no original personal meta)

## Phase 2 — UI shell (read-only, no chain writes)

- [ ] Full-viewport **MoltenMetal** background (`ogl` + `MoltenMetal.css`)
- [ ] Translucent **Header** with `cryptita long.svg` (opacity ~0.4–0.55)
- [ ] Centered **ProfileCard** (front + back, click-to-flip) — markup ported from repo-root `index.html` / `style.css`
- [ ] Translucent **Footer**: Facebook + LinkedIn buttons + “Proof of Learning & Building” block (see `03`)
- [ ] No-scroll shell: `100dvh`, `overflow: hidden` on `html` / `body` / app root. `[LOCKED]`
- [ ] Card scale wrapper: `transform: scale()` at narrow viewports; cap ~1020px; `visualViewport` counter-zoom. `[LOCKED]`
- [ ] Copy static partner SVGs to `web/public/assets/` (not `public/profile.png` as photo source). `[LOCKED]`
- [ ] **Do not scaffold:** `WalletBar`, `Hero`, `AboutSkills`, `Learn`, `CreateForm`, `Proof` section, wallet connect UI. `[REMOVE]`

## Phase 3 — Move package

- [ ] New Move package under `move/` (do not copy original `portfolio.move` text, comments, or Display camp copy)
- [ ] Package name **`builder_card`**; module **`builder_card`**; file `builder_card.move`. `[LOCKED]`
- [ ] Struct **`BuilderCard`** with thirteen string fields as specified in `04` (not `Portfolio`, not `course` / `school` / `linkedin_url` / `github_url`)
- [ ] `create_builder_card` — thirteen string args + `&mut TxContext`; transfer new object to sender. `[LOCKED]`
- [ ] Skip Publisher/Display. **No `init` Display.** `[LOCKED]`
- [ ] `sui move build`
- [ ] `sui move test` — at least `test_create_builder_card_fields`; recommended `test_create_builder_card_transferred_to_sender`

## Phase 4 — Read path

- [ ] `suiClient.ts`: `SuiClient` + `getFullnodeUrl('mainnet')` (or current docs default)
- [ ] `mapBuilderCard.ts`: map `content.fields` when type ends with `::builder_card::BuilderCard`
- [ ] Hook `usePortfolio` (read-only name): `getObject` on `VITE_PORTFOLIO_OBJECT_ID`; empty / loading / error / success states
- [ ] Split `skills` on `,`, trim, drop empties → chips. `[LOCKED]`
- [ ] Render front-face fields; **do not** render `about` in the DOM. `[LOCKED]`
- [ ] Photo `src` from on-chain **`photo_url`** — not `public/profile.png` as source of truth. `[LOCKED]`
- [ ] Derived credential row: **ISSUED** from chain; **NETWORK** from `VITE_SUI_NETWORK` label; **OBJECT ID** and **OWNER** from `getObject` response. `[LOCKED]`
- [ ] Copy buttons + optional Suiscan link on OBJECT ID; explorer link for object id
- [ ] Empty `VITE_PORTFOLIO_OBJECT_ID`: build succeeds; runtime shows empty/error card — **no fake identity**. `[LOCKED]`

## Phase 5 — Write path (CLI only)

- [ ] **No** create form, **no** PTB from browser, **no** `signAndExecuteTransaction`. `[LOCKED]`
- [ ] Document full CLI loop in README (see `06` §7):
  - `sui client publish` → Package ID
  - `sui client call --module builder_card --function create_builder_card` with **thirteen** `--args` in order from `04` (bash + PowerShell)
  - Paste **Created Object ID** into `VITE_PORTFOLIO_OBJECT_ID`
  - `npm run build` → redeploy `dist/`
- [ ] **Do not** implement `useCreatePortfolio`, `create_portfolio`, or `package::portfolio::create_portfolio`. `[REMOVE]`

## Phase 6 — Workshop extras

- [ ] README: Learn → Build → Deploy for Cryptita Plays (CLI create + env configure + read-only site)
- [ ] Official Sui install + faucet/docs links (generic)
- [ ] Mainnet publish + `create_builder_card` instructions with all thirteen args
- [ ] Gas troubleshooting: link to current official Sui docs — no `tools/` balance script. `[LOCKED]`
- [ ] Vercel: root `web/`, `npm run build`, set `VITE_*` env vars, redeploy after ID changes. `[LOCKED]`
- [ ] README must **not** imply Connect Wallet or submit-from-website create. `[LOCKED]`

## Phase 7 — Ship

- [ ] `sui move build` && `sui move test` pass locally
- [ ] Publish Move package to Mainnet (`sui client publish`)
- [ ] `sui client call create_builder_card` → record Package ID + **Created Object ID**
- [ ] Set `VITE_PORTFOLIO_OBJECT_ID` and `VITE_SUI_NETWORK` in `web/.env` (and Vercel env for production)
- [ ] `cd web && npm run build`
- [ ] Deploy `dist/` to Vercel (HTTPS read-only site)
- [ ] Full loop verification from `07-testing-and-verification-spec.md`
- [ ] Confirm **zero** original org names, logos, sample identity, and sample IDs
- [ ] Confirm **no** wallet UI anywhere on hosted site. `[LOCKED]`

---

## Original elements that must not appear

| Element | Action |
| ------- | ------ |
| DEVCON / original camp titles | Replace |
| Personal sample name, school, socials, meta author | Replace |
| `devcon.png` and camp OG images | Do not use |
| Sample GitHub/Vercel URLs from the original README | Do not use |
| Display template legal paragraph | Do not use |
| `gh-pages` homepage URL to original user | Do not use |
| Hardcoded mainnet/testnet IDs from `constants.ts` / `Move.lock` | Do not reuse |
| `create_portfolio`, `Portfolio` struct, old field set | **Replace** with `BuilderCard` / `create_builder_card` `[LOCKED]` |
| Browser wallet / dapp-kit / create form write path | **Remove** — CLI only `[LOCKED]` |
| `public/profile.png` as on-chain photo substitute | **Remove** — use `photo_url` `[LOCKED]` |

---

## Traceability reminder

| Topic | Spec |
| ----- | ---- |
| Locked product decisions | `01-project-spec.md` |
| Repo tree, data flow | `02-architecture-spec.md` |
| Layout, brand, scaling | `03-ui-ux-and-brand-spec.md` |
| Move struct, CLI args | `04-sui-and-smart-contract-spec.md` |
| Frontend files, deps, mapping | `05-frontend-implementation-spec.md` |
| Env, deploy, README | `06-deployment-and-environment-spec.md` |
| Manual verification | `07-testing-and-verification-spec.md` |

If a decision conflicts with this checklist, follow **Locked decisions** in `01-project-spec.md`.
