# Security Report — Baltimore Kings

## 12-Point Security Checklist

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 1 | RLS enabled on all tables | PASS | All 18 tables have RLS enabled with explicit policies. Helper functions (get_user_role, is_coach_or_above, is_superadmin) use SECURITY DEFINER. |
| 2 | No service role key in client code | PASS | `SUPABASE_SERVICE_ROLE_KEY` only used in `src/lib/supabase/server.ts` (createServiceClient) and `src/app/api/applications/route.ts`. Never exposed to browser bundles. |
| 3 | API routes validate session + role | PASS | All admin routes call `requireRole('coach')` or `requireRole('superadmin')`. Stripe webhook validates signature. Public routes (applications, ical) are appropriately open. |
| 4 | Input validation with zod | PASS | All forms and API routes use zod schemas from `src/lib/validations.ts`. Extra fields rejected by strict schemas. |
| 5 | File uploads validated | PASS | `src/app/api/documents/upload/route.ts` validates MIME type (allowlist) and enforces 10MB size limit server-side. Files stored in private Supabase bucket. |
| 6 | Stripe webhook signature verified | PASS | `src/app/api/stripe/webhook/route.ts` calls `stripe.webhooks.constructEvent()` with the webhook secret. Rejects invalid signatures with 400. |
| 7 | Rate limiting | TODO | Rate limiting not yet implemented on /api/apply, /api/auth/*, and webhook endpoints. Recommend adding Vercel KV or Upstash rate limiter. |
| 8 | CSRF protection | PASS | Next.js App Router with SameSite cookies handles CSRF. All mutating routes are POST/PUT/DELETE (not GET). Stripe webhook uses signature verification instead of CSRF. |
| 9 | CSP headers | PASS | Strict Content-Security-Policy set in `next.config.ts` allowing only required domains (Stripe, Supabase, YouTube, Instagram, Google Maps). frame-ancestors not set (DENY via X-Frame-Options). |
| 10 | No secrets committed | PASS | `.env.local` in .gitignore. `.env.example` contains only placeholder variable names. No API keys in source code. |
| 11 | Audit log | PASS | `audit_log` table exists. `logAudit()` helper in `src/lib/audit.ts`. Called on role changes, approvals. Webhook events logged via payment record creation. |
| 12 | Account deletion | TODO | GDPR-style deletion flow not yet built. Recommend adding a "Request deletion" button in profile that flags the account, and a superadmin "Hard delete" action with CASCADE. |

## Summary

- **10/12 checks PASS**
- **2/12 are TODOs** (rate limiting, account deletion)
- Zero TypeScript errors
- Zero lint errors
- Build passes cleanly (47 routes compiled)

## Recommendations

1. **Rate limiting** — Add `@upstash/ratelimit` with Vercel KV on the application endpoint and auth routes. Estimated 30 minutes of work.
2. **Account deletion** — Add DELETE /api/profile endpoint that cascades through all user data. Add UI button in profile settings. Estimated 1 hour.
3. **EXIF stripping** — Photo uploads should strip EXIF metadata. Add `sharp` processing on upload route. Estimated 30 minutes.
4. **Signed URL expiry** — Document download URLs should have short TTL (15 minutes). Currently using Supabase's default signed URL expiry.

---

## CMS / Content-Token layer — security checks (2026-06-05)

| Check | Status | Notes |
|-------|--------|-------|
| Service-role key isolation | PASS | `SUPABASE_SERVICE_ROLE_KEY` referenced only in `src/lib/supabase/server.ts` (`createServiceClient`); no `'use client'` file references it; absent from `.next/static`. Token resolution uses anon/session clients only. |
| Token API RLS | PASS | `/api/content-tokens/[token]` resolves under anon (public, cached) or the caller's session (members); never service role. Validates key format. |
| Page write APIs | PASS | create/save/publish/actions/revisions all `requireRole('coach')` → 401/403 verified unauthenticated. |
| Token write APIs | PASS | create/update/delete + preview all `requireRole('coach')` → 401 verified. |
| Nav write APIs | PASS | create/reorder/update/delete `requireRole('coach')` → 401 verified. |
| Fee write APIs + checkout | PASS | create/waive/checkout `requireRole('coach')` (checkout: authed player, own assignment only) → 401 verified. |
| Eval isolation | PASS (RLS) | `player_evaluations` RLS: a player reads only own rows with `visibility='shared'`; coach/superadmin full. `/app/my-evaluations` filters `profile_id = auth.uid()` + `shared`. |
| `_resolved` strip on save | PASS | `stripResolved()` runs in PUT/publish so resolved records are never persisted — only bindings. |
| Reserved-slug guard | PASS | Enforced at create API (reject), render route (404 on reserved), and a DB CHECK constraint on `pages.slug`. |
| Minor protection | PASS | `public_profiles` view nulls a minor's bio and never projects school/hometown/DOB/phone; anon has no row policy on `profiles` directly. |
| `public_profiles` SECURITY DEFINER | ACCEPTED EXCEPTION | Supabase linter flags it ERROR, but it is the safer choice here: anon reads only the filtered, column-projected view, never `profiles`. Reviewed and intentional. |
| Embed sanitization | PENDING | Dedicated `EmbedHTML` block not yet built; CSP already restricts `frame-src`/`script-src` to known providers (Stripe, YouTube, Instagram, Google Maps). |

