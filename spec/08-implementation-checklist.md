# 08 — Implementation Checklist

Build a **new** Cryptita Plays repo from this `/spec` package. Do not clone or copy the original source.

---

## Phase 1 — Scaffold

- [ ] Create frontend with Vite + React + TypeScript
- [ ] Add one `src/styles.css` file. **No Tailwind.** `[LOCKED]`
- [ ] Install current official Sui client + wallet kit (versions from docs **today**)
- [ ] Add React Query only if the kit requires it
- [ ] `main.tsx`: providers, **defaultNetwork mainnet**
- [ ] `config.ts`: `VITE_SUI_NETWORK`, `VITE_PACKAGE_ID`, `VITE_PORTFOLIO_OBJECT_ID`
- [ ] Cryptita Plays title in `index.html` (no original personal meta)

## Phase 2 — UI shell (no chain writes yet)

- [ ] Header with Cryptita Plays wordmark
- [ ] Hero / About / Skills / Learn / Proof / Footer structure
- [ ] Placeholder empty states
- [ ] Responsive layout
- [ ] Participant `public/profile.png` slot
- [ ] Wallet connect + disconnect + truncated address (no SUI balance) `[LOCKED]`

## Phase 3 — Move package

- [ ] New Move package (do not copy `portfolio.move` text/comments/Display camp copy)
- [ ] `Portfolio` fields as specified in `04`
- [ ] `create_portfolio` transferring object to sender
- [ ] Skip Publisher/Display. **No `init` Display.** `[LOCKED]`
- [ ] `sui move build`
- [ ] Minimal `sui move test`

## Phase 4 — Read path

- [ ] Hook: `getObject` (or current equivalent)
- [ ] Map fields + split skills
- [ ] Loading and error UI (no fake identity)
- [ ] Explorer link for object id

## Phase 5 — Write path

- [ ] Create form (seven strings)
- [ ] PTB `package::portfolio::create_portfolio`
- [ ] `signAndExecuteTransaction`
- [ ] Parse created object id + digest
- [ ] Success / reject / fail states
- [ ] Document CLI `sui client call` as backup

## Phase 6 — Workshop extras

- [ ] README: Learn → Build → Deploy for Cryptita Plays
- [ ] Official Sui install + faucet/docs links (generic)
- [ ] Mainnet publish instructions
- [ ] Vercel: root `web/`, `npm run build` `[LOCKED]`

## Phase 7 — Ship

- [ ] Publish Move package to Mainnet
- [ ] Record package id + object id in env
- [ ] `npm run build`
- [ ] Deploy `dist`
- [ ] Full loop verification from `07`
- [ ] Confirm **zero** original org names, logos, sample identity, and sample IDs

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

---

## Traceability reminder

If a decision conflicts with this checklist, follow **Locked decisions** in `01-project-spec.md`.
