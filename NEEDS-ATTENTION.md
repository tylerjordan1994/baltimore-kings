# NEEDS ATTENTION

**Upload logo files at /app/admin/brand. Until then, text mark is shown sitewide.**

## Content Gaps — [NEEDS CONFIRMATION]

1. **GOALS Baltimore exact address** — Used in homepage venue section and footer. Need confirmed street address + parking details.
2. **Baltimore Kings founding year** — Not available on current site. Club history section uses general language.
3. **Head coach name and bio** — Not found on existing site. Needed for team pages and coach section.
4. **Players who moved up to MASL2 Salisbury Steaks** — No specific names available. "Pathway" section uses general language.
5. **Salisbury Steaks details** — Limited info found. Used general "same management" language.
6. **Brand colors confirmation** — Used navy (#1a2744) + gold (#C9A94E) based on the uploaded logo. The logo itself is navy/gold/white with the Maryland flag diamond pattern.
7. **Team photos** — No high-res photos extracted. Placeholder approach used — swap in real photography.
8. **Sponsor logos and names** — Current site shows affiliation badges (MASL3, Pro-SA) but no commercial sponsors extracted.
9. **SUPERADMIN_EMAIL_2** — Second superadmin email (head coach) needs to be set in env vars.
10. **Tyler's profile** — [NEEDS CONTENT] bio, position, jersey number, headshot upload for tylerjordan1994@gmail.com (superadmin + also_plays=true).

## Fallbacks Used

| Feature | Intended | Fallback Used | Action Needed |
|---------|----------|---------------|---------------|
| Instagram Feed | Instagram Basic Display API with long-lived token | Not implemented — manual curation via admin media manager | Set up Instagram Business account, get API token, build feed component |
| MASL3 Roster | Scrape from masl3.com SPA | Admin roster import (coach can add players manually) | Build CSV/JSON import tool in admin, or reverse-engineer MASL3 API |
| Printify Products | Fetch via Printify API | Static featured products section (coach-curated) | Investigate Printify API access, or manually update product cards |
| Email (Resend) | Full transactional email | Templates written, Resend integration coded | Add RESEND_API_KEY to env vars, verify domain |
| YouTube Feed | Auto-fetch from @danzafut channel | Manual YouTube URL entry per tutorial | Could add YouTube Data API integration later |
| MASL3 Historical Stats | Stats import from masl3.com | Link card to masl3.com stats page | No action — intentionally trimmed |
| Logo Assets | Auto-fetch from website | Admin upload at /app/admin/brand + text placeholder | Upload logos via admin UI |

## TODOs

- [ ] Upload logo files at `/app/admin/brand`
- [ ] Add `SUPABASE_SERVICE_ROLE_KEY` to Vercel env vars (get from Supabase dashboard → Settings → API)
- [ ] Add `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` to Vercel env vars
- [ ] Add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to Vercel env vars
- [ ] Add `RESEND_API_KEY` to Vercel env vars
- [ ] Set up Stripe webhook endpoint: `https://tylerjordandesigns.com/project/football-team/api/stripe/webhook`
- [ ] Configure Supabase Auth redirect URLs to include `https://tylerjordandesigns.com/project/football-team/auth/callback`
- [ ] Add rewrite rules to main tylerjordandesigns.com Vercel project (see below)
- [ ] Set `SUPERADMIN_EMAIL_2` for the head coach
- [ ] Upload team photos to Supabase storage and update media_items
- [ ] Create first superadmin accounts by signing up with the configured emails
- [ ] Fill in Tyler's player profile (bio, position, jersey number, headshot)
- [ ] Review and confirm all [NEEDS CONFIRMATION] copy

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
