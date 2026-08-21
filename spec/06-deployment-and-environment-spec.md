# 06 — Deployment and Environment Specification

Production shape (original and new): `[REPOSITORY]` `[USER REQUIREMENT]`

```text
Static frontend  →  Hosting  →  Browser
                      ↑
                 Sui wallet  →  Sui Mainnet  →  Move package
```

No app server. `[REPOSITORY]`

---

## 1. Smart contract — prerequisites

From original workshop guide (adapt branding/OS, keep toolchain ideas): `[REPOSITORY]`

- Node.js LTS
- Git
- Sui CLI (`sui --version`)
- Sui client address (ed25519 was workshop default)
- Mainnet SUI for gas
- `sui client switch --env mainnet` (or `sui client new-env --alias mainnet --rpc https://fullnode.mainnet.sui.io:443`)

Original Windows-specific Chocolatey + partner-school skip is **not** required for Cryptita Plays docs. `[RECOMMENDATION]` point to official Sui install: `https://docs.sui.io/guides/developer/getting-started/sui-install`. `[REPOSITORY]` listed that URL.

**UNKNOWN:** whether Chocolatey `sui` package remains the right Windows path — **do not document Chocolatey.** Official install only. `[LOCKED]`

### Build / test / publish

```text
cd move   # original: portfolio_contract
sui move build
sui move test          # original had no tests [RECOMMENDATION]
sui client publish
```

Record **PackageID** from publish output. `[REPOSITORY]`

If republishing: original warns to delete stale `Published.toml`. `[REPOSITORY]` Follow current CLI behavior.

### Create object (CLI backup)

```text
sui client call
  --function create_portfolio
  --module portfolio
  --package <PACKAGE_ID>
  --args
    "<name>" "<course>" "<school>" "<about>"
    "<linkedin>" "<github>"
    "<Skill 1,Skill 2,Skill 3>"
```

PowerShell: backticks for line continuation with **no trailing space**. `[REPOSITORY]`

Save **Created ObjectID**. `[REPOSITORY]`

### CLI gas (v1)

**Do not include** `sui-balance-to-coin-tool` in the new repo. `[LOCKED]`

If `sui client publish` fails with no gas coin, README should say: follow the **current** Sui CLI / gas documentation. Do not copy the original helper script.

Website transactions are paid by the **connected browser wallet**, not the CLI keystore. `[LOCKED]`

---

## 2. Frontend — local

```text
cd web    # original: portfolio_frontend
npm install
npm run dev      # http://localhost:5173
npm run build    # outDir dist, sourcemap false [REPOSITORY]
npm run preview
```

### Environment

Create `.env` / `.env.local` (gitignored; original `.gitignore` includes `.env`). `[REPOSITORY]`

```text
VITE_SUI_NETWORK=mainnet
VITE_PACKAGE_ID=0x...
VITE_PORTFOLIO_OBJECT_ID=0x...
```

Original used committed constants instead of env. `[REPOSITORY]` Env is clearer for hosting. `[RECOMMENDATION]` Hosting UI must set the same `VITE_*` **at build time** (Vite inlines them).

Do not put private keys in env for the website.

---

## 3. Frontend — production

Original path: GitHub repo + **Vercel**, Root Directory = `portfolio_frontend`, Build Command `npm run build`. `[REPOSITORY]`

Also leftover `homepage` + `gh-pages` script pointing at a GitHub Pages path — unused in the Level 1 README. `[REMOVE]`

**Cryptita Plays hosting:** **Vercel**, Root Directory = `web`, Build Command `npm run build`. `[LOCKED]`

```text
Install
  → set VITE_* 
  → npm run build
  → publish dist/
```

SPA: single `index.html`; no rewrites required beyond serving `index.html` for the root. `[REPOSITORY]` no client routes.

Photo: `public/profile.png` ships with the static build. `[REPOSITORY]`

---

## 4. Accounts (workshop)

Original: GitHub + Vercel (sign in Vercel with GitHub). **Keep this.** `[LOCKED]` `[REPOSITORY]`

---

## 5. Domain

No custom domain in v1. Default `*.vercel.app` is enough. `[LOCKED]`

---

## 6. What not to deploy

- CLI keystore
- `node_modules`
- Move `build/` artifacts (optional to keep out of git; original gitignores `build/`) `[REPOSITORY]`
- Original `Move.lock` published IDs as if they were Cryptita Plays packages `[REMOVE]`
