# 06 — Deployment and Environment Specification

Workshop deployment model: **CLI-only writes** (publish + `create_builder_card`), **read-only static frontend** (`getObject` only). No app server, no browser wallet, no hosted-origin wallet checks. `[LOCKED]`

```text
Participant (CLI + IDE)
    │
    ├─ sui client publish          → Package ID (README / notes)
    ├─ sui client call create_builder_card --args …  → Created Object ID
    ├─ VITE_PORTFOLIO_OBJECT_ID in .env
    ├─ npm run build               → dist/
    └─ Vercel (root web/)          → HTTPS read-only site

Browser
    └─ @mysten/sui getObject       → Sui Mainnet fullnode
```

Cross-references: struct and CLI arg order in `04-sui-and-smart-contract-spec.md`; verification in `07-testing-and-verification-spec.md`.

---

## 1. Prerequisites

### Accounts (workshop)

| Account | Purpose |
| ------- | ------- |
| GitHub | Source repo |
| Vercel | Static hosting (sign in with GitHub) `[LOCKED]` |

No custom domain in v1 — default `*.vercel.app` is sufficient. `[LOCKED]`

### Toolchain

| Tool | Notes |
| ---- | ----- |
| **Node.js** LTS | For `web/` (`npm install`, `npm run build`) |
| **Git** | Clone / push workshop repo |
| **Sui CLI** | `sui --version` — **official install only** |
| **Sui client address** | ed25519 is the workshop default `[REPOSITORY]` |
| **Mainnet SUI** | Gas for `sui client publish` and `sui client call` |

### Sui CLI installation

**Do not document Chocolatey or third-party package managers for Sui.** `[LOCKED]`

Point participants to the **current official** install guide:

- https://docs.sui.io/guides/developer/getting-started/sui-install

Verify with:

```bash
sui --version
sui client active-address
```

### Mainnet environment

Default production network is **Sui Mainnet**. `[LOCKED]`

```bash
sui client switch --env mainnet
```

If `mainnet` is not configured:

```bash
sui client new-env --alias mainnet --rpc https://fullnode.mainnet.sui.io:443
sui client switch --env mainnet
```

Testnet is **README-only** for optional practice; the shipped app defaults to Mainnet read + `VITE_SUI_NETWORK` display label. No in-app network switcher. `[LOCKED]`

### Gas / address balance

After Sui v1.72+, transferred SUI may sit in **address balance** instead of a `Coin<SUI>` object. If `sui client publish` or `sui client call` fails with no gas coin, follow **current official Sui docs** to fund the address or convert balance to a coin.

**Do not ship** a `tools/` balance-to-coin script in v1. `[LOCKED]` Document the official workaround in the workshop README only.

---

## 2. Move package — build, test, publish

Package root: `move/` (module `builder_card`, struct `BuilderCard`). See `04` for full schema.

```bash
cd move
sui move build
sui move test
sui client switch --env mainnet
sui client publish --gas-budget 100000000
```

Record the **Package ID** from publish output (e.g. `0xabc…`). Store in README notes; optional `VITE_PACKAGE_ID` is **not required** for the read-only homepage to render an existing object.

If republishing, delete stale `Published.toml` when your toolchain requires it. `[REPOSITORY]`

New projects use `0x0` in `Move.toml` until publish. Do not copy sample package IDs from other workshops. `[LOCKED]`

---

## 3. Create `BuilderCard` (CLI only)

The **only** write path for workshop participants is `sui client call create_builder_card` with **thirteen string arguments** in the order defined in `04`. `[LOCKED]`

There is **no** Connect Wallet, **no** website create form, and **no** browser PTB in v1.

### Bash (macOS / Linux / Git Bash)

```bash
sui client call \
  --package 0xPACKAGE_ID \
  --module builder_card \
  --function create_builder_card \
  --args \
    "Alex Rivera" \
    "BP-042" \
    "Smart Contract Developer" \
    "Cryptita Build & Deploy 2026" \
    "Philippines" \
    "DeFi Protocols" \
    "2024" \
    "Move on Sui" \
    "Cryptita Plays" \
    "Move, Sui, TypeScript, React" \
    "August 2026" \
    "Workshop participant learning Sui Move." \
    "https://example.com/photos/alex.jpg" \
  --gas-budget 10000000
```

### PowerShell (Windows)

Use backticks for line continuation — **no trailing space** after a backtick. `[REPOSITORY]`

```powershell
sui client call `
  --package 0xPACKAGE_ID `
  --module builder_card `
  --function create_builder_card `
  --args "Alex Rivera" "BP-042" "Smart Contract Developer" "Cryptita Build & Deploy 2026" "Philippines" "DeFi Protocols" "2024" "Move on Sui" "Cryptita Plays" "Move, Sui, TypeScript, React" "August 2026" "Workshop participant learning Sui Move." "https://example.com/photos/alex.jpg" `
  --gas-budget 10000000
```

### After create

1. Parse transaction effects for the **created object** whose type ends with `::builder_card::BuilderCard`.
2. Record the **Created Object ID** (e.g. `0xdef…`).
3. Set env vars (see §4).
4. **Rebuild** the frontend so Vite inlines `VITE_*` values.
5. Redeploy the static site.

A second `create_builder_card` call mints a **new** owned object; update `VITE_PORTFOLIO_OBJECT_ID` to point at the object you want displayed.

---

## 4. Environment variables

Create `web/.env` or `web/.env.local` (gitignored). Never commit private keys or keystore material. `[LOCKED]`

```env
# Required for populated card (may be empty before first create)
VITE_PORTFOLIO_OBJECT_ID=0xCREATED_OBJECT_ID

# Display label on card NETWORK row + RPC selection at build time
VITE_SUI_NETWORK=mainnet
```

| Variable | When to set | Used for |
| -------- | ----------- | -------- |
| `VITE_PORTFOLIO_OBJECT_ID` | After `create_builder_card` | `getObject` target; empty → empty card state `[LOCKED]` |
| `VITE_SUI_NETWORK` | At scaffold / build time | Human **NETWORK** label (e.g. map `mainnet` → `Sui Mainnet`) + `getFullnodeUrl` network key `[LOCKED]` |

### Optional

| Variable | Notes |
| -------- | ----- |
| `VITE_PACKAGE_ID` | Documentation / debug only; read-only site does not need it to render an existing object. Still required in README for CLI `--package` examples. |

### Build-time behavior

Vite **inlines** `import.meta.env.VITE_*` at build time. Changing `.env` requires:

```bash
cd web
npm run build
```

…and a redeploy for hosted sites. Dev server restart is required for local `npm run dev` after env changes.

### Empty object ID

The site **must build successfully** with `VITE_PORTFOLIO_OBJECT_ID` empty or unset. Runtime shows empty/error card state — no fake identity. `[LOCKED]`

### What not to put in env

- CLI keystore paths or mnemonics
- Private keys
- Wallet adapter secrets

Object ID and package ID are **public** on-chain identifiers; safe to commit in workshop notes, not in `.env` if you prefer local-only config.

---

## 5. Frontend — local development

```bash
cd web
npm install
npm run dev      # default http://localhost:5173
npm run build    # output: dist/
npm run preview  # serve dist/ locally
```

| Script | Purpose |
| ------ | ------- |
| `npm run dev` | Vite dev server, `host: true` recommended for device testing |
| `npm run build` | Production bundle to `dist/` |
| `npm run preview` | Local smoke test of production build |

Pin `@mysten/sui` to whatever official Sui docs recommend **on scaffold day**. Use `getFullnodeUrl('mainnet')` for RPC — do not copy legacy PublicNode URLs. `[LOCKED]`

---

## 6. Frontend — production (Vercel)

**Hosting:** Vercel, **Root Directory = `web`**, Build Command `npm run build`, Output Directory `dist` (Vite default). `[LOCKED]`

```text
Git push (or import repo)
  → Vercel project settings: Root Directory = web
  → Environment variables: VITE_PORTFOLIO_OBJECT_ID, VITE_SUI_NETWORK
  → Build: npm run build
  → Publish: dist/ as static SPA
```

### Vercel environment variables

Set the same `VITE_*` keys in the Vercel project **before** build:

| Key | Example |
| --- | ------- |
| `VITE_PORTFOLIO_OBJECT_ID` | `0x…` (created object) |
| `VITE_SUI_NETWORK` | `mainnet` |

Trigger a **redeploy** after changing env vars so the new values are inlined.

### SPA routing

Single route (`/`). No React Router. Serve `index.html` at root; no special rewrites beyond default static hosting. `[LOCKED]`

### Hosted origin requirements

- **HTTPS** (Vercel default)
- **No wallet connect** on the hosted site — reads only `[LOCKED]`
- **No wallet-on-hosted-origin verification** in workshop docs or QA `[LOCKED]`
- Object fetch must work from the browser via the configured fullnode (if RPC blocks, switch to `getFullnodeUrl('mainnet')` per `04`) `[LOCKED]`

### Removed from original deployment path

| Item | Action |
| ---- | ------ |
| `gh-pages` / `homepage` field | **Remove** — Vercel only `[LOCKED]` |
| `portfolio_frontend` root directory name | **Replace** with `web/` `[LOCKED]` |
| `public/profile.png` as on-chain photo source | **Remove** — photo from on-chain `photo_url` `[LOCKED]` |
| Browser wallet pays gas | **Remove** — CLI keystore pays publish/create `[LOCKED]` |

---

## 7. Workshop README requirements (implementation time)

The repo `README.md` is written when the app is scaffolded. It must document the **full CLI loop** below. `[LOCKED]`

### Required README sections

1. **Prerequisites** — Node, Git, official Sui install link, Mainnet gas, GitHub + Vercel accounts.
2. **Publish** — `sui move build`, `sui move test`, `sui client publish`, record Package ID.
3. **Create** — Full `sui client call create_builder_card` with **all thirteen `--args`** in order (bash + PowerShell examples matching `04`).
4. **Configure after create** — paste Created Object ID into `VITE_PORTFOLIO_OBJECT_ID`; set `VITE_SUI_NETWORK`; rebuild (`npm run build`).
5. **Deploy** — Vercel root `web/`, set `VITE_*` in Vercel env, redeploy after ID changes.
6. **Verify** — point to `07-testing-and-verification-spec.md` checklist; Suiscan object link.
7. **Gas troubleshooting** — link to current official Sui docs if publish/call fails on gas coin; no custom script.

### README must not imply

- Connect Wallet on the website
- Submit create from a browser form
- Wallet allowlist / HTTPS checks for signing on the hosted origin
- `create_portfolio` or old field set (`course`, `school`, `linkedin_url`, `github_url`)

### Config-after-create flow (document verbatim)

```text
sui client publish
  → Package ID (for CLI --package)

sui client call create_builder_card --args <13 strings>
  → Created Object ID

Set VITE_PORTFOLIO_OBJECT_ID=0x… in web/.env (and Vercel env for production)

npm run build
  → redeploy dist/

Open site → card shows on-chain fields + derived OBJECT ID / OWNER / NETWORK
```

---

## 8. What not to deploy

| Item | Reason |
| ---- | ------ |
| CLI keystore / mnemonics | Security |
| `node_modules/` | Rebuilt on host |
| Move `build/` artifacts | Optional gitignore `[REPOSITORY]` |
| Original camp `Move.lock` published IDs | Do not reuse `[REMOVE]` |
| `tools/` gas scripts | Out of scope v1 `[LOCKED]` |
| Wallet provider bundles / dapp-kit | No browser writes `[LOCKED]` |

---

## 9. Deployment pipeline summary

```text
1. Install toolchain (Node, Git, Sui CLI — official install)
2. sui client switch --env mainnet
3. cd move && sui move build && sui move test
4. sui client publish → Package ID
5. sui client call create_builder_card (13 args) → Object ID
6. web/.env: VITE_PORTFOLIO_OBJECT_ID, VITE_SUI_NETWORK
7. cd web && npm install && npm run build
8. Deploy dist/ to Vercel (root web/)
9. Verify per 07 (no wallet steps)
```

There is **no** step  “connect wallet on hosted site” or “submit form in browser.” `[LOCKED]`
