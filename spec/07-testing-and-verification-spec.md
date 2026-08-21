# 07 — Testing and Verification Specification

Original repository: **no Move tests, no frontend test files, no CI workflows.** `[REPOSITORY]`

Tests below are **practical workshop checks**, plus **recommended** minimal Move tests. `[RECOMMENDATION]` `[USER REQUIREMENT]`

Cross-references: struct and CLI arg order in `04-sui-and-smart-contract-spec.md`; frontend behavior in `05-frontend-implementation-spec.md`; deployment env in `06-deployment-and-environment-spec.md`.

---

## 1. Smart contract

### Build

- [ ] `sui move build` succeeds.

### Tests (new)

- [ ] `sui move test` succeeds.
- [ ] `test_create_builder_card_fields`: each of the **thirteen** string fields matches input (same arg order as `04` §5).
- [ ] `test_create_builder_card_transferred_to_sender` (recommended): created `BuilderCard` is owned by the test sender.

There is no original test to clone. `[REPOSITORY]`

### Manual CLI

- [ ] Publish on the intended network (workshop: Mainnet).
- [ ] `sui client call --module builder_card --function create_builder_card` succeeds with **thirteen** string `--args` in order from `04`.
- [ ] Created object type ends with `::builder_card::BuilderCard`; fields match CLI arguments on Suiscan.
- [ ] A second `create_builder_card` call produces a **new** object id. `[REPOSITORY]` behavior

---

## 2. Frontend (manual)

| Check | Pass criteria |
| ----- | ------------- |
| Load | App renders header + centered ProfileCard + footer at `/` (no-scroll) `[LOCKED]` |
| Responsive | Usable at ~375px and ~1280px |
| Missing object ID | Empty/error state, not a fake identity `[RECOMMENDATION]` |
| Invalid object ID | Error message; app does not crash |
| Valid object ID | `builder_name`, `builder_no`, `profession`, `program`, `country`, `specialization`, `building_since`, `focus`, `community`, `skills`, `issued` match chain; derived OBJECT ID / OWNER / NETWORK rows correct |
| Skills parse | `"A, B,C"` → three chips `[REPOSITORY]` |
| Photo | `<img src={photo_url}>` loads from on-chain URL; broken URL shows graceful fallback — **not** `public/profile.png` as source of truth `[LOCKED]` |
| Card flip | Click toggles front/back; keyboard accessible `[LOCKED]` |
| Copy buttons | OBJECT ID and OWNER copy to clipboard with feedback |
| Explorer link | Suiscan object page opens for configured id `[REPOSITORY]` |
| About field | `about` is on-chain but **not** rendered in the DOM `[LOCKED]` |
| No scroll | `100dvh`, `overflow: hidden` — no page scroll at ~375px, ~768px, ~1280px `[LOCKED]` |
| Card aspect | Internal proportions hold **1.56 / 1**; card does not grow past ~1020px design cap on large viewports `[LOCKED]` |
| Scale-down | Narrow viewports shrink whole card via `transform: scale` — chips/type do not reflow to alternate layout `[LOCKED]` |
| Browser zoom | Ctrl/Cmd +/- does not enlarge on-screen card past design cap (`visualViewport` compensation) `[LOCKED]` |
| Footer links | Facebook and LinkedIn open Cryptita URLs from `03` |

**Removed checks (do not verify — out of scope v1):** Connect Wallet, disconnect, wallet modal, wrong-network wallet warning, create form, browser PTB, `signAndExecuteTransaction`, `useCreatePortfolio`. `[LOCKED]`

---

## 3. Integration (full loop — CLI only)

```text
CLI publish → CLI create_builder_card → env → build → deploy → browser getObject
```

1. `cd move && sui move build && sui move test`
2. `sui client publish` on Mainnet → record **Package ID**
3. `sui client call create_builder_card` with **thirteen** string args (bash or PowerShell per `04` / `06`)
4. Record **Created Object ID** from transaction effects
5. Set `VITE_PORTFOLIO_OBJECT_ID` and `VITE_SUI_NETWORK` in `web/.env`
6. `cd web && npm run build` — build succeeds with populated env
7. `npm run dev` or `npm run preview`: card shows on-chain fields + derived credentials
8. Deploy `dist/` to Vercel (root `web/`); hosted URL shows the same on-chain data (not only localhost)
9. Change a CLI arg, create a **second** object, update env, rebuild, redeploy — UI reflects new object

There is **no** wallet connect step and **no** browser create form in v1. `[LOCKED]`

### Empty-env smoke (before first create)

- [ ] `VITE_PORTFOLIO_OBJECT_ID` empty or unset
- [ ] `npm run build` still succeeds `[LOCKED]`
- [ ] Runtime shows empty/error card — no placeholder personal identity

---

## 4. Deployment verification checklist

- [ ] Hosted site is HTTPS (Vercel default).
- [ ] Network is Mainnet for production; `VITE_SUI_NETWORK` display label correct (e.g. `Sui Mainnet`).
- [ ] Package ID and object ID are the participant’s, not original sample IDs. `[REMOVE]`
- [ ] Footer/header say Cryptita Plays, not original organizers. `[USER REQUIREMENT]`
- [ ] No leftover original camp logos or sample identity in built HTML.
- [ ] Object fetch works from the hosted origin via `getFullnodeUrl('mainnet')` (or documented RPC). If RPC blocks the browser, switch endpoint per `04` / `06`. `[LOCKED]`
- [ ] **No** wallet connect on hosted origin — reads only `[LOCKED]`
- [ ] **No** wallet-on-hosted-origin verification in workshop QA `[LOCKED]`

---

## 5. Gas (v1)

No shipped balance-to-coin helper. `[LOCKED]` Verify `sui client publish` and `sui client call` against current CLI; if either fails on gas, update README with official docs — do not add a custom script unless a later workshop revision requires it.

---

## 6. Out of scope

Automated E2E, visual regression, load tests — not in original and not required for the workshop. `[REPOSITORY]` `[RECOMMENDATION]`

Browser wallet flows, create-form transaction tests, and dapp-kit integration tests are **explicitly out of scope** for v1. `[LOCKED]`
