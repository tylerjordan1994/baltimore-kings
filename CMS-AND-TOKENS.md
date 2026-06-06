# Baltimore Kings — Pages, Navigation & Content Tokens (Coach Guide)

This site has a built-in visual editor. You compose **pages** out of blocks, manage the
**menu**, and bind blocks to **content tokens** so they show live data (rosters, schedule,
sponsors) — all without a developer or a deploy.

Everything below lives under the admin area at `/app/admin/...` (coach / superadmin only).

---

## 1. The mental model

- You manage **data** in the backend (Roster Manager, Schedule, Sponsors, etc.).
- You compose **pages** on top of that data in the **Pages** editor (Puck).
- A **Content Token** is a named handle — e.g. `[first-team-roster]` — that points at live
  data. You drag a data-bound block onto a page, open its settings, and pick a token from the
  **Data source** dropdown. The block then renders whatever that token resolves to.

Change the *look* (columns, heading, card style) in the block's settings. Change *which records
show* by editing the token. One token can feed many pages — update the data once, every page
bound to it updates.

---

## 2. Pages (`/app/admin/pages`)

- **Create** — give it a title; the slug auto-fills (you can edit it). Nested slugs like
  `teams/futsal-l1` are allowed. A slug can never be `app`, `api`, `auth`, `sign-in`,
  `sign-up`, or `editor` (those are reserved).
- **Edit** — opens the visual editor. Drag blocks from the left, edit their settings on the
  right. **Save draft** keeps it private; **Publish** makes it live at its slug.
- **Publish / Unpublish**, **Duplicate**, **Set home**, **Delete** — row actions.
- **Revisions** — every publish snapshots the page. Open *Revisions* to **restore** an older
  version (your current content is snapshotted first, so restore is safe).
- A published, public page is visible at `https://tylerjordandesigns.com/project/football-team/<slug>`.

### Blocks
- **Layout / content:** Hero, Heading, Rich Text, Button, Spacer.
- **Data-bound:** Player Cards, Schedule List, Sponsor Strip. These need a token (below).
- Color fields offer **brand colors only** (paper, ink, navy, gold, court) — you can't pick an
  off-brand color by accident.

### Inline value tokens
In any text, write a value token in brackets and it resolves at render time. Example:
`Founded [club-founded-year].` → `Founded 2012.`

---

## 3. Content Tokens (`/app/admin/tokens`)

Click **New token**, give it a **name** (the key auto-fills, e.g. `First Team Roster` →
`first-team-roster`). Pick a **collection** (what kind of data) and a **mode**:

- **dynamic** — a live, filtered query. Updates automatically as data changes.
  - *players* → pick a team, sort, limit.
  - *events* → scope (public/members), upcoming/past, limit.
  - *sponsors / achievements / media / social / learn / teams* → active-only, sort, limit.
- **curated** — a hand-picked, ordered list of specific record IDs.
- **value** — a single value: a literal, a **site setting** (e.g. `founded_year`), or a
  **computed** value (e.g. `next_match`).

The wizard shows a **live preview** ("12 results") as you adjust the filter, so you can see
what a token returns before saving. You can also create a token straight from a block's
**Data source** dropdown via **+ Create a new token**.

**Binding a block:** drop a Player Cards / Schedule List / Sponsor Strip block on a page →
open its settings → **Data source** → choose a matching token. The dropdown only lists tokens
of the right type (a Player Cards block only shows *players* tokens).

### Seeded tokens
`[first-team-roster]`, `[second-team-roster]`, `[masl3-roster]`, `[upcoming-public-events]`,
`[active-sponsors]`, `[next-match]`, `[club-founded-year]`, `[featured-players]`.

### When does the page update after I change data?
Public token results are cached for speed. They refresh automatically when the underlying data
changes (e.g. adding a player to a team busts the *players* caches) and at most every few
minutes otherwise. Publishing a page refreshes that page immediately.

---

## 4. Navigation (`/app/admin/navigation`)

Manage the **Primary** (header) and **Footer** menus. Add a **Link** or a **Group** (dropdown),
nest links under a group, set the label, **drag to reorder**. Give a group a **feature card**
(image + blurb) for the mega-menu. Mark an item **Members** to hide it from the public, or **CTA**
to style it as the apply button. The public **header mega-menu and footer both render entirely
from here** — no code changes needed. (See §8 for the full editor.)

---

## 5. Backend modules tied to the site

- **Player Evaluations (`/app/admin/player-evaluations`)** — build a template (named criteria,
  1–5 ratings, groups), evaluate a player, save **coach-only** or **shared**. Shared evaluations
  appear on the player's **My Evaluations** page as a radar chart; coach-only ones never do.
- **Fees (`/app/admin/fees`)** — create a fee, assign it to a whole team or specific players,
  and track who's paid. Players pay on **My Fees** via Stripe Checkout; paid status updates
  automatically. You can **waive** a fee.

---

## 6. Raw HTML embeds & safety

Embedded HTML (social sliders, maps) is restricted to known providers (Instagram, Facebook,
YouTube, Google Maps) and is coach/superadmin-only. *(The dedicated EmbedHTML block is on the
roadmap; until then, embeds are handled via the existing media/social tooling.)*

---

## 7. What you can do vs. what needs a developer

**You can, with no deploy:** add / remove / reorder pages and menu items; edit any page's
content; bind blocks to tokens; create tokens in any mode; run every backend module (roster,
evaluations, fees, schedule).

**A developer adds new *capabilities*:** a brand-new block type, a new token collection, or a
new third-party integration. Once a developer registers it, it shows up in your block palette /
token wizard for you to compose with. You compose from what's registered; you don't conjure new
block types yourself.

---

## 8. More admin tools

- **Navigation (`/app/admin/navigation`)** — now manages the full header mega-menu: create
  **groups** (dropdowns), nest links under them, add a **feature card** (image + blurb) per group,
  drag to reorder. The public header renders entirely from this.
- **Site Settings (`/app/admin/settings`)** — founding year, contact, social handles, default
  share image, public/dashboard themes. Feeds value tokens (`[club-founded-year]`) and the site.
- **Sponsors (`/app/admin/sponsors`)** — add/edit sponsors; they appear anywhere a sponsors token
  is bound (homepage, footer, pages) the moment you save.
- **Quick-add Players (`/app/admin/quick-add`)** — paste a roster block to create players + team
  assignments in one go.
- **Edit from the front end** — when you're logged in as a coach, a floating **admin bar** appears
  on the public site: "Edit this page" jumps straight into the editor, plus quick links to Pages,
  Tokens, and the Menu. Shopify-style.

## 9. For players

- **Make an account** — sign up; a coach approves you.
- **Playbook (`/app/playbook`)** — view formations, set pieces, and plays your coaches publish.
- **My Evaluations (`/app/my-evaluations`)** — performance feedback shared by coaches, as a radar chart.
- **My Fees (`/app/fees`)** — pay outstanding dues / session fees via Stripe; see your history.
- **Schedule** — public events also export as an **iCal feed** (footer → Subscribe) to add to any calendar.
