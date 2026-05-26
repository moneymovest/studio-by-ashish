# Framebook — Development Report

Status: Work done locally and pushed to origin/main; diagnostics added and deployed.

## Summary

- Problem: the professional dashboard would sometimes hang on "Loading your dashboard..." and the professionals search was not returning expected results for newly signed-up professionals.
- Root causes found: newly created users stored service data only in auth metadata (no `professionals` rows); production sometimes lacked admin client access; client-side auth/bootstrap effects could fail and leave loading state set.

## High-level changes (chronological)

- Investigated `app/professionals`, `components/landing/professionals-browser.tsx`, `app/actions/professional.ts`, and signup flow.
- Added upsert of `professionals` row on signup in `app/api/profiles/route.ts` (POST).
- Enhanced `getProfessionals` and server actions to synthesize results from `auth.admin.listUsers()` when `professionals` rows were missing (server fallback).
- Updated `components/landing/professionals-browser.tsx` to merge client fallback results and improve the empty-search state.
- Fixed hydration/loader mismatch by adjusting `LoaderProvider` and `FramebookLoader` behavior.
- Converted `app/professionals/[id]/page.tsx` to a client-friendly lookup when needed.
- Implemented `ProfessionalDashboard` (client) with editable profile, avatar/media upload previews (localStorage), service toggles, and API save that updates both Supabase auth metadata and posts to `/api/profiles` to upsert DB rows.
- Fixed TypeScript error by extending the `AuthUser` type to include `id` and metadata fields used in the dashboard.

## Bug: Dashboard stuck on load — investigation & fixes

1. Observed the dashboard stuck in a loading state when `useAuthUser`'s auth calls failed or when client supabase calls timed out.
2. Changes applied:
   - `components/auth/useAuthUser.ts`: wrap `supabase.auth.getSession()` in try/catch/finally and ensure `loading` is cleared on error; make unsubscribe safe.
   - Add a server GET handler to `app/api/profiles/route.ts` to return `{ profile, professional }` for a given `userId` (server/admin fallback).
   - `components/landing/professional-dashboard.tsx`: implement a timed client `supabase` fetch (timeout 8s) and fall back to `/api/profiles` if the client fetch fails or times out. Ensure `loadingProfile` is always cleared in a finally block.
   - Add a diagnostic banner (visible on the dashboard when loaded) that reports which fetch path executed and any error text (`diagSource` / `diagError`) to aid debugging in production.

## Files changed or added (key paths)

- `app/api/profiles/route.ts` — POST upsert; added GET fallback endpoint.
- `components/auth/useAuthUser.ts` — robust error handling and unsubscribe safety.
- `components/landing/professional-dashboard.tsx` — dashboard implementation, timed client fetch, server fallback, diagnostic banner.
- `components/landing/professionals-browser.tsx` — client-side search/fallback improvements.
- `app/actions/professional.ts` — server actions: `getProfessionals`, `getProfessionalById` (auth-admin fallback and profile merge).
- `components/LoaderProvider.jsx`, `FramebookLoader.jsx` — hydration fixes (deterministic ready state).
- `app/profile/page.tsx` — renders dashboard conditionally for professionals.
- `components/auth/useAuthUser.ts` — `AuthUser` type fix (includes `id`).

## Commits pushed (not exhaustive)

- c74e140 — "Fix professional dashboard loading" (earlier commit in flow)
- 9a64d9d — auth hook fix pushed
- d14247d — diagnostic banner pushed

## What I validated locally

- `npm run build` succeeded after the fixes (local build and typecheck passed).
- Added guarded fetch logic and diagnostics to avoid hangs and to reveal which path ran in production.

## Production observations

- Production `/profile` initially showed "Sign in required" because there was no client session in the test browser.
- Console warning observed in production: GoTrueClient multiple instances warning — not fatal but worth investigating to avoid duplicated clients.
- After pushing diagnostic changes, the dashboard will show a small diagnostic banner indicating `client`, `client-failed`, `server`, or `server-failed` and any error message.

## How to test / reproduce

1. Run locally:
   - Install, build, and run dev:
     ```bash
     npm install
     npm run dev
     ```
   - Open `http://localhost:3000/profile` and sign in as a professional account.
2. Production checks:
   - Hard-refresh `/profile` (Ctrl+Shift+R / Cmd+Shift+R) to pick up latest deploy.
   - If dashboard remains on "Loading your dashboard...", check DevTools Console for errors (particularly GoTrue or network timeouts). The diagnostic banner (top of page) will show which path ran and any server/client error.

## Next recommended steps

- Investigate GoTrueClient duplication — ensure only one Supabase client is initialized and reuse it across the app.
- Consider server-side endpoint(s) to serve essential profile data when `NEXT_PUBLIC_SUPABASE_ANON_KEY` is missing in the runtime (avoid relying solely on client for bootstrapping).
- Add server media upload handling (S3 or Supabase Storage) for portfolio items.
- Add automated UI tests that assert `loadingProfile` clears even when network failures occur.

## Notes / Known limitations

- The diagnostic banner is temporary and should be removed once the root cause is confirmed and fixed.
- Some local build steps may require network access to Google Fonts; in CI/CD this can fail if the host blocks Google Fonts (observed as build warnings/errors during local testing).

---

Report generated by the development agent during the active debugging session. If you want, I can commit this file to the repository (already added) and open a Pull Request with a short description.
