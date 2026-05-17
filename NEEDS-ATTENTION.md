# NEEDS ATTENTION

**Upload logo files at /app/admin/brand. Until then, text mark is shown sitewide.**

## Content Gaps — [NEEDS CONFIRMATION]

1. ~~**GOALS Baltimore exact address**~~ — RESOLVED: 6159 Edmondson Ave, Catonsville, MD 21228
2. ~~**Benfield Sports address**~~ — RESOLVED: 1031 Benfield Blvd, Millersville, MD 21108
3. **Baltimore Kings founding year** — Not available on current site. Club history section uses general language.
4. **Head coach name and bio** — Needed for /join/coaches page. Template cards ready to fill.
5. **Salisbury Steaks site URL** — Needed for the STEAKS chip link on player profiles. Currently [NEEDS CONFIRMATION].
6. **Brand colors confirmation** — Used navy (#1a2744) + gold (#C9A94E) based on the uploaded logo.
7. **Team photos** — No high-res photos extracted. Placeholder approach used — swap in real photography.
8. **Sponsor logos and names** — Current site shows affiliation badges (MASL3, Pro-SA) but no commercial sponsors extracted.
9. **SUPERADMIN_EMAIL_2** — Second superadmin email (head coach) needs to be set in env vars.
10. **Tyler's profile** — [NEEDS CONTENT] bio, position, jersey number, headshot upload for tylerjordan1994@gmail.com.

## Recruiting Platform — [NEEDS CONTENT]

11. **Player costs** — All amounts on /join/costs are [NEEDS CONFIRMATION]: annual dues, ref fees, tournament costs, travel, gear.
12. **Player testimonials** — /join/stories has template cards ready to fill from player interviews.
13. **Alumni profiles** — /join/alumni page built; admin CRUD ready. Add alumni via /app/admin (alumni manager).
14. **Coach bios and credentials** — /join/coaches has placeholder cards. Fill with real coach info.
15. **Required documents list** — Orientation step 8 asks for documents. Confirm which are required: waiver / photo ID / medical form.
16. **Communication channel** — Orientation references team messaging. Confirm: Slack / GroupMe / WhatsApp?

## Systems Scaffolded (Working UI, Needs Follow-Up)

| System | Status | What's Built | Follow-Up Needed |
|--------|--------|-------------|-----------------|
| Contracts | Scaffolded | Admin CRUD, player signing UI, assignment flow | PDF generation on signing, expiration cron job, renewal flow |
| Training Regimens | Scaffolded | Focus areas CRUD, assignment, progress tracking | Auto-assignment by position, bulk assign, position-default seed data |
| Player Orientation | Schema only | DB table + types | Full 10-step guided flow UI, coach approval gate |
| Scouting Pipeline | Scaffolded | Kanban-style prospect tracker | Magic-link invite flow, pre-filled application |
| Player Evaluations | Scaffolded | Coach create/review, player view when shared | Integration with player goals, quarterly review flow |
| Player Goals | Scaffolded | Goal setting, coach feedback | Quarterly review integration with evaluations |
| Newsletter | Scaffolded | Signup component + API route | Resend audience integration, broadcast admin tool |
| Press Kit | Not started | — | Public /press page, auto-generated fact sheet PDF, downloadable ZIP |

## Fallbacks Used

| Feature | Intended | Fallback Used | Action Needed |
|---------|----------|---------------|---------------|
| Instagram Feed | Instagram Basic Display API | Manual curation via admin media manager | Set up Instagram Business account + API token |
| MASL3 Roster | Scrape from masl3.com SPA | Admin roster import (manual) | Build CSV/JSON import tool |
| Printify Products | Fetch via Printify API | Static featured products (coach-curated) | Investigate Printify API |
| Email (Resend) | Full transactional email | Templates coded, Resend integration ready | Add RESEND_API_KEY, verify domain |
| MASL3 Historical Stats | Stats import | Link card to masl3.com | Intentionally trimmed |
| Logo Assets | Auto-fetch | Admin upload + text placeholder | Upload logos at /app/admin/brand |

## TODOs

- [ ] Upload logo files at `/app/admin/brand`
- [ ] Add `SUPABASE_SERVICE_ROLE_KEY` to Vercel env vars
- [ ] Add Stripe keys (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`)
- [ ] Add `RESEND_API_KEY` to Vercel env vars
- [ ] Set up Stripe webhook endpoint
- [ ] Configure Supabase Auth redirect URLs
- [ ] Add rewrite rules to tylerjordandesigns.com (see below)
- [ ] Set `SUPERADMIN_EMAIL_2` for the head coach
- [ ] Upload team photos
- [ ] Create first superadmin accounts
- [ ] Fill in Tyler's player profile
- [ ] Fill in /join/costs with actual amounts
- [ ] Collect player testimonials for /join/stories
- [ ] Add alumni profiles via admin
- [ ] Fill in coach bios for /join/coaches
- [ ] Seed focus_areas with position-specific training defaults
- [ ] Build orientation 10-step flow (schema ready, UI needed)
- [ ] Build contract PDF generation
- [ ] Build contracts expiration cron
- [ ] Build press kit page + auto-generated fact sheet

## Rewrite for tylerjordandesigns.com

Add this to the main site's `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/project/football-team/:path*", "destination": "https://baltimore-kings.vercel.app/project/football-team/:path*" },
    { "source": "/project/football-team", "destination": "https://baltimore-kings.vercel.app/project/football-team" }
  ]
}
```
