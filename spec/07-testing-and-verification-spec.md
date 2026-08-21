# 07 — Testing and Verification Specification

Original repository: **no Move tests, no frontend test files, no CI workflows.** `[REPOSITORY]`

Tests below are **practical workshop checks**, plus **recommended** minimal Move tests. `[RECOMMENDATION]` `[USER REQUIREMENT]`

---

## 1. Smart contract

### Build

- [ ] `sui move build` succeeds.

### Tests (new)

- [ ] `sui move test` succeeds.
- [ ] Creating a portfolio sets `name` (and ideally other fields) as passed in.
- [ ] Created object is owned by the test sender.

There is no original test to clone. `[REPOSITORY]`

### Manual CLI

- [ ] Publish on the intended network.
- [ ] `sui client call` create succeeds.
- [ ] Object visible in explorer; fields match arguments.
- [ ] A second create produces a **new** object id. `[REPOSITORY]` behavior

---

## 2. Frontend (manual)

| Check | Pass criteria |
| ----- | ------------- |
| Load | App renders header + sections at `/` |
| Responsive | Usable at ~375px and ~1280px |
| Missing object ID | Empty/error state, not a fake identity `[RECOMMENDATION]` |
| Invalid object ID | Error message |
| Valid object ID | Name, course, school, about, skills, links match chain |
| Skills parse | `"A, B,C"` → three chips `[REPOSITORY]` |
| Photo | `profile.png` shows; missing file does not crash |
| Connect | Wallet modal; address appears |
| Disconnect | Returns to connect CTA |
| Wrong network | Warning if wallet is not Mainnet `[LOCKED]` |
| Create disabled | No wallet or empty package ID |
| Create success | Digest + object id shown; explorer opens |
| Create reject | User cancellation shown without crash |
| Create fail | Chain/simulation error shown |
| Verify link | Explorer object page (fields or equivalent) `[REPOSITORY]` |

---

## 3. Integration (full loop)

```text
Frontend → Wallet → Transaction → Sui Mainnet → Contract → Result → Frontend
```

1. Publish package (CLI).
2. Set `VITE_PACKAGE_ID`, rebuild/reload.
3. Connect wallet that has gas.
4. Submit create form.
5. Confirm digest on explorer.
6. Set `VITE_PORTFOLIO_OBJECT_ID` to created id (or auto-fill session state).
7. Reload: UI matches form data.
8. `npm run build` succeeds.
9. Hosted URL shows the same on-chain data (not only localhost).

CLI-only path (original workshop): skip 3–4; use `sui client call`; still do 6–9. `[REPOSITORY]`

---

## 4. Deployment verification checklist

- [ ] Hosted site is HTTPS.
- [ ] Network is Mainnet for production.
- [ ] Package ID and object ID are the participant’s, not original sample IDs. `[REMOVE]`
- [ ] Footer/header say Cryptita Plays, not original organizers. `[USER REQUIREMENT]`
- [ ] No leftover original logos.
- [ ] Wallet connect works on the hosted origin (wallet allowlist / HTTPS).
- [ ] Object fetch works from the hosted origin. If RPC blocks the browser, switch to `getFullnodeUrl('mainnet')` or another documented endpoint. `[LOCKED]`

---

## 5. Gas (v1)

No shipped balance-to-coin helper. `[LOCKED]` Verify `sui client publish` against current CLI; if it fails on gas, update README with official docs — do not add a custom script unless a later workshop revision requires it.

---

## 6. Out of scope

Automated E2E, visual regression, load tests — not in original and not required for the workshop. `[REPOSITORY]` `[RECOMMENDATION]`
