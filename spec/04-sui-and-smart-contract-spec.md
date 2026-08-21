# 04 — Sui and Smart Contract Specification

This document is the **authoritative contract spec** for the Cryptita Plays workshop. It defines the Move package, the on-chain `BuilderCard` object, **CLI-only writes**, and how the read-only frontend consumes chain data.

**Canonical names (locked with `01` / `02`):**

| Artifact | Name |
| -------- | ---- |
| Move package | `builder_card` |
| Move module | `builder_card` |
| Struct | `BuilderCard` |
| Create function | `create_builder_card` |
| Env key for Object ID | `VITE_PORTFOLIO_OBJECT_ID` |

There is **no** browser wallet integration, **no** create form, **no** `@mysten/dapp-kit`, and **no** Programmable Transaction Block (PTB) or `signAndExecute` from the website.

---

## 1. Workshop loop (publish → create → env → read)

```text
sui client publish                    → Package ID (for CLI + README)
sui client call create_builder_card   → Created Object ID
.env  VITE_PORTFOLIO_OBJECT_ID        → that Object ID
      VITE_SUI_NETWORK                → display label (e.g. "Sui Mainnet")
vite build                            → inlines VITE_* at build time
frontend getObject(id)                → content.fields + objectId + owner
```

| Step | Actor | Output | Used by |
| ---- | ----- | ------ | ------- |
| 1 | `sui client publish` | **Package ID** | CLI `--package`; optional README |
| 2 | `sui client call create_builder_card` | **Created Object ID** | `VITE_PORTFOLIO_OBJECT_ID` |
| 3 | Set `.env` + rebuild | Inlined config | Vite static build |
| 4 | `getObject` on load | Fields + owner + id | ProfileCard UI |

**Empty / error states:** The site may be built and deployed **before** publish/create. If `VITE_PORTFOLIO_OBJECT_ID` is empty or `getObject` fails, the card shows an empty or error state — **no fake identity**. IDs become correct only after publish + create + env update + rebuild.

**Copy controls:** OBJECT ID and OWNER rows show **truncated** values (e.g. first 6 + `…` + last 4). Copy buttons write the **full** value from the live `getObject` response. OBJECT ID may link to Suiscan: `https://suiscan.xyz/mainnet/object/{id}/fields`.

---

## 2. Runtime-derived fields (not Move fields)

These appear on the card but are **never** stored in `BuilderCard`:

| UI label | Source | Notes |
| -------- | ------ | ----- |
| **NETWORK** | `VITE_SUI_NETWORK` | Human-readable label at build time (e.g. `Sui Mainnet`). Not a struct field. |
| **OBJECT ID** | `getObject` → `objectId` | On-chain object address; not duplicated in Move. |
| **OWNER** | `getObject` → `owner` | Current owner (typically `AddressOwner`); not duplicated in Move. |

**ISSUED** is the opposite: it **is** on-chain (`issued` field) and maps to the card bottom row.

Do **not** add `object_id`, `owner`, or `network` to the Move struct. Do **not** pass them to `create_builder_card`.

---

## 3. Sui network and read client

### Target network

- **Production: Sui Mainnet.** Workshop targets Mainnet publish and create.
- The app **defaults to Mainnet** for RPC reads. No in-app network switcher.
- `VITE_SUI_NETWORK` is a **display label** for the NETWORK row. It does not need to match an RPC enum unless the implementer derives the fullnode URL from it.

### RPC / client

Use the current official Sui TypeScript SDK (`@mysten/sui`) with `getFullnodeUrl('mainnet')` or the endpoint recommended in official docs on scaffold day.

The frontend performs **one read operation** against the configured object:

```typescript
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';

const client = new SuiClient({ url: getFullnodeUrl('mainnet') });

const response = await client.getObject({
  id: import.meta.env.VITE_PORTFOLIO_OBJECT_ID,
  options: { showContent: true, showOwner: true },
});
```

| Action | Required? | Notes |
| ------ | --------- | ----- |
| `getObject` by `VITE_PORTFOLIO_OBJECT_ID` | Yes | Maps `content.fields` to card UI |
| Show owner | Yes | From response — **not** on-chain field |
| Show object ID | Yes | From response — **not** on-chain field |
| Show network label | Yes | From `VITE_SUI_NETWORK` — **not** on-chain field |
| Connect wallet | **No** | Removed |
| Create / update / burn from browser | **No** | Removed |
| PTB / `signAndExecute` / dapp-kit | **No** | Removed |

Parse `content.fields` only when `content.dataType === 'moveObject'` and the type ends with `::builder_card::BuilderCard`.

### Gas / address balance

After Sui v1.72, transferred SUI may sit in **address balance**; `sui client publish` and `sui client call` may require a `Coin<SUI>` object. If the CLI cannot find a gas coin, follow **current official Sui docs** to fund the address or convert balance to a coin.

**Do not ship a balance-to-coin script in v1.** Document the official workaround in the workshop README.

---

## 4. Move package layout

### Purpose

Prove the participant published a package and created an **immutable owned record** of builder profile fields, then displayed it on a read-only website.

**Omit:** `Publisher`, `Display`, One-Time Witness, and any `init` that claims a publisher. Explorers show raw struct fields.

### Directory

```text
move/
├── Move.toml
├── Move.lock              # generated after first build/publish
└── sources/
    └── builder_card.move  # single module
```

### `Move.toml`

```toml
[package]
name = "builder_card"
version = "0.1.0"
edition = "2024"

[addresses]
builder_card = "0x0"
```

Use the Sui Move compiler version installed for the workshop (flavor `sui`). Pin versions in `Move.lock` after first publish. Published address replaces `0x0` in `Move.toml` / `Published.toml` per toolchain workflow.

---

## 5. Module `builder_card`

**Module name:** `builder_card` (matches package name and file `builder_card.move`). Do **not** use a separate `portfolio` module in v1.

### Imports (reference)

```move
module builder_card::builder_card;

use std::string::String;
use sui::object::{Self, UID};
use sui::transfer;
use sui::tx_context::{Self, TxContext};
```

### Struct: `BuilderCard`

Single owned object type. Abilities: `key, store`.

```move
public struct BuilderCard has key, store {
    id: UID,
    builder_name: String,
    builder_no: String,
    profession: String,
    program: String,
    country: String,
    specialization: String,
    building_since: String,
    focus: String,
    community: String,
    skills: String,      // comma-separated; frontend splits to chips
    issued: String,      // card bottom ISSUED row
    about: String,       // on-chain only; NOT rendered on card
    photo_url: String,   // profile image URL; not a local file path
}
```

**Thirteen string fields** (excluding `id: UID`).

**Dropped fields (do not include):** `course`, `school`, `linkedin_url`, `github_url`, and legacy `name` (replaced by `builder_name`).

**Not struct fields:** object ID, owner address, network label — see §2.

### Function: `create_builder_card`

| Property | Value |
| -------- | ----- |
| Visibility | `public fun` (callable from CLI; `entry` optional for docs only) |
| Inputs | Thirteen `String` arguments (order below) + `&mut TxContext` |
| Output | None — mints `BuilderCard`, `transfer::transfer` to `tx_context::sender(ctx)` |
| Validation | None required for workshop (no URL checks, no non-empty enforcement) |
| Updates / burn | **None** — each call creates a **new** owned object |

**Argument order** (must match CLI `--args`, Move implementation, and tests):

| # | Parameter | Example |
| - | --------- | ------- |
| 1 | `builder_name` | `"Alex Rivera"` |
| 2 | `builder_no` | `"BP-042"` |
| 3 | `profession` | `"Smart Contract Developer"` |
| 4 | `program` | `"Cryptita Build & Deploy 2026"` |
| 5 | `country` | `"Philippines"` |
| 6 | `specialization` | `"DeFi Protocols"` |
| 7 | `building_since` | `"2024"` |
| 8 | `focus` | `"Move on Sui"` |
| 9 | `community` | `"Cryptita Plays"` |
| 10 | `skills` | `"Move, Sui, TypeScript, React"` |
| 11 | `issued` | `"August 2026"` |
| 12 | `about` | `"Workshop participant learning Sui Move."` |
| 13 | `photo_url` | `"https://example.com/photos/alex.jpg"` |

### Reference implementation

```move
public fun create_builder_card(
    builder_name: String,
    builder_no: String,
    profession: String,
    program: String,
    country: String,
    specialization: String,
    building_since: String,
    focus: String,
    community: String,
    skills: String,
    issued: String,
    about: String,
    photo_url: String,
    ctx: &mut TxContext,
) {
    let card = BuilderCard {
        id: object::new(ctx),
        builder_name,
        builder_no,
        profession,
        program,
        country,
        specialization,
        building_since,
        focus,
        community,
        skills,
        issued,
        about,
        photo_url,
    };
    transfer::transfer(card, tx_context::sender(ctx));
}
```

### Events

None. Frontend uses `getObject` only — no event subscription.

---

## 6. Move tests (required)

Add **at least two** tests in `builder_card.move` (or `builder_card_tests.move` if the workshop splits files). Test literals must use the **same thirteen-argument order** as the CLI example in §7.

### `test_create_builder_card_fields`

Call `create_builder_card` with known strings; obtain the created object in the test scenario and assert **each** of the thirteen string fields matches input.

```move
#[test_only]
use sui::test_scenario::{Self as ts};

#[test]
fun test_create_builder_card_fields() {
    let sender = @0xA;
    let mut scenario = ts::begin(sender);

    {
        let ctx = ts::ctx(&mut scenario);
        create_builder_card(
            std::string::utf8(b"Alex Rivera"),
            std::string::utf8(b"BP-042"),
            std::string::utf8(b"Smart Contract Developer"),
            std::string::utf8(b"Cryptita Build & Deploy 2026"),
            std::string::utf8(b"Philippines"),
            std::string::utf8(b"DeFi Protocols"),
            std::string::utf8(b"2024"),
            std::string::utf8(b"Move on Sui"),
            std::string::utf8(b"Cryptita Plays"),
            std::string::utf8(b"Move, Sui, TypeScript, React"),
            std::string::utf8(b"August 2026"),
            std::string::utf8(b"Workshop participant learning Sui Move."),
            std::string::utf8(b"https://example.com/photos/alex.jpg"),
            ctx,
        );
    };

    ts::next_tx(&mut scenario, sender);
    {
        let card = ts::take_from_sender<BuilderCard>(&scenario);
        assert!(card.builder_name == std::string::utf8(b"Alex Rivera"), 0);
        assert!(card.builder_no == std::string::utf8(b"BP-042"), 1);
        assert!(card.profession == std::string::utf8(b"Smart Contract Developer"), 2);
        assert!(card.program == std::string::utf8(b"Cryptita Build & Deploy 2026"), 3);
        assert!(card.country == std::string::utf8(b"Philippines"), 4);
        assert!(card.specialization == std::string::utf8(b"DeFi Protocols"), 5);
        assert!(card.building_since == std::string::utf8(b"2024"), 6);
        assert!(card.focus == std::string::utf8(b"Move on Sui"), 7);
        assert!(card.community == std::string::utf8(b"Cryptita Plays"), 8);
        assert!(card.skills == std::string::utf8(b"Move, Sui, TypeScript, React"), 9);
        assert!(card.issued == std::string::utf8(b"August 2026"), 10);
        assert!(card.about == std::string::utf8(b"Workshop participant learning Sui Move."), 11);
        assert!(card.photo_url == std::string::utf8(b"https://example.com/photos/alex.jpg"), 12);
        ts::return_to_sender(&scenario, card);
    };

    ts::end(scenario);
}
```

### `test_create_builder_card_transferred_to_sender` (recommended)

Assert the created object is owned by the transaction sender after `create_builder_card`.

Run tests before publish:

```bash
cd move
sui move test
```

---

## 7. CLI: publish and create

### Prerequisites

```bash
sui client switch --env mainnet
sui client active-address    # funded with SUI for gas
```

### Publish

```bash
cd move
sui move build
sui move test
sui client publish --gas-budget 100000000
```

Record the **Package ID** from output (e.g. `0xabc…`). Delete stale `Published.toml` before republish if the toolchain requires it.

### Create `BuilderCard`

Full `sui client call` with **thirteen string args** in the order from §5:

**Unix / macOS / Git Bash:**

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

**Windows (PowerShell):**

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
2. Set env and rebuild:

```env
VITE_PORTFOLIO_OBJECT_ID=0xCREATED_OBJECT_ID
VITE_SUI_NETWORK=Sui Mainnet
```

3. `npm run build` in `web/` so Vite inlines `VITE_*`.
4. Verify card fields, ISSUED, and derived OBJECT ID / OWNER / NETWORK on the deployed or local preview site.

`VITE_PACKAGE_ID` is **optional** for the read-only site; keep Package ID in README for CLI examples.

---

## 8. Card field mapping (on-chain → UI)

Mapping follows the card prototype (`index.html` / `style.css`). Card **front** is 1:1 with on-chain identity fields **except** `about` (stored, not rendered). Card **back** (flip) uses fixed workshop assets — not on-chain.

### Front face — identity grid

| Move field (`content.fields`) | Card label (UI) | Rendering notes |
| ----------------------------- | --------------- | --------------- |
| `photo_url` | (profile image) | `<img src={photo_url}>`; `alt={builder_name}` when known |
| `builder_name` | BUILDER | Identity heading (`<h1>`) |
| `builder_no` | BUILDER NO. | |
| `profession` | PROFESSION | |
| `program` | PROGRAM | |
| `country` | COUNTRY | |
| `specialization` | SPECIALIZATION | |
| `building_since` | BUILDING SINCE | |
| `focus` | FOCUS | |
| `community` | COMMUNITY | |
| `skills` | SKILLS | Split on `,`, trim whitespace, render chips (e.g. `"A, B,C"` → three chips) |
| `about` | — | **Not rendered** — omit from DOM |

### Card bottom — credential row

| Source | Card label | Rendering notes |
| ------ | ---------- | --------------- |
| `issued` (on-chain) | **ISSUED** | Display as stored (e.g. `08-08-26` or `August 2026`) |
| `VITE_SUI_NETWORK` | **NETWORK** | Display label only |
| `getObject` → `objectId` | **OBJECT ID** | Truncated + copy; optional Suiscan link |
| `getObject` → `owner` | **OWNER** | Truncated + copy |

Footer Facebook / LinkedIn URLs are **static site config**, not Move fields.

---

## 9. Environment variables

| Variable | Set when | Used for |
| -------- | -------- | -------- |
| `VITE_PORTFOLIO_OBJECT_ID` | After `create_builder_card` | `getObject` target — **created Object ID** |
| `VITE_SUI_NETWORK` | At build time | NETWORK row label (e.g. `Sui Mainnet`) |

Workshop continuity: the env key name says `PORTFOLIO` but the value is the **`BuilderCard` object ID**, not the package ID.

---

## 10. Deployment pipeline (CLI-only writes)

```text
Develop Move (builder_card package)
  → sui move build
  → sui move test
  → sui client switch --env mainnet
  → sui client publish
  → Record Package ID
  → sui client call create_builder_card (13 string args)
  → Record Created Object ID
  → Set VITE_PORTFOLIO_OBJECT_ID + VITE_SUI_NETWORK
  → Rebuild frontend (vite build)
  → Verify card fields, ISSUED, OBJECT ID, OWNER, NETWORK
  → Deploy static site (e.g. Vercel, web/ root)
```

There is **no** connect-wallet or create-from-website step. New projects start with `0x0` in `Move.toml`; do not copy another participant's package or object IDs.

---

## 11. Explicit removals

Do **not** implement or document in this workshop:

| Removed | Reason |
| ------- | ------ |
| Browser wallet connect / disconnect | CLI-only writes |
| `WalletProvider`, `@mysten/dapp-kit`, `signAndExecute` from website | CLI-only writes |
| On-page create form, `useCreatePortfolio`, browser PTB | CLI-only writes |
| On-chain `course`, `school`, `linkedin_url`, `github_url` | Schema simplified |
| `Display`, `Publisher`, OTW, camp legal copy in Move | Raw fields only |
| `update_*`, `share`, `burn` entry functions | Immutable after create |
| `public/profile.png` as photo source of truth | Use `photo_url` on-chain |

---

## 12. Resolved ambiguities

| Topic | Decision |
| ----- | -------- |
| Struct name | **`BuilderCard`** everywhere |
| Module name | **`builder_card`** (not `portfolio`) |
| Package name | **`builder_card`** |
| `public` vs `entry` on `create_builder_card` | `public fun` sufficient for CLI |
| Display for grading? | **No** — raw struct fields |
| Shared vs owned | **Owned** only; site needs configured object ID |
| Network switching | **No** UI switcher; Mainnet read + env label |
| Skills format | Single comma-separated `String`; frontend splits |
| Object ID / owner / network on-chain? | **No** — runtime-derived at read time |
| Env key for object ID | **`VITE_PORTFOLIO_OBJECT_ID`** (historical name; holds Object ID) |

---

## 13. CLI `--args` quick reference

Copy-paste order for `sui client call … --args` (13 strings):

1. `builder_name`
2. `builder_no`
3. `profession`
4. `program`
5. `country`
6. `specialization`
7. `building_since`
8. `focus`
9. `community`
10. `skills`
11. `issued`
12. `about`
13. `photo_url`
