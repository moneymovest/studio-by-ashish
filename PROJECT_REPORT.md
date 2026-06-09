# Framebook — Development Report

Status: Updated, validated, and pushed to `origin/main`.

## Summary

The professional dashboard had two classes of problems:

1. It could get stuck or look broken because auth/profile initialization was fragile.
2. The actual edit flow for profile, avatar, and media updates was not reliably persisting because the professional row and ownership fields were not being written in a way that matched the table policy.

The latest pass also cleaned up the user experience so save and upload actions now show explicit in-flight states instead of looking frozen.

## What Was Fixed

- Professional profile ownership now uses both `id` and `user_id` when bootstrapping rows so RLS can pass and updates can persist.
- Avatar uploads and portfolio uploads now have visible progress feedback and cannot be double-triggered while a request is active.
- Bio/profile/service/review actions now disable their save buttons while saving and relabel them to `Saving...`.
- Invalid Supabase auth sessions that produce `invalid compact JWS` now get cleared locally so uploads stop inheriting a broken token.
- The dashboard still keeps the earlier fallback behavior for profile loading and search, so it can recover when the client session or the Supabase client is flaky.

## Root Cause Notes

The main dashboard breakage came from a mismatch between UI expectations and the database ownership model:

- The `professionals` table is keyed by a record ID, but it also requires `user_id` for the owner policy.
- Earlier code paths were writing only `id` in some cases, which meant inserts and upserts could fail or behave inconsistently depending on the path.
- Once that happened, avatar/media upload and save flows depended on a row that either did not exist or was not writable under policy.

## Chronological Change Log

1. Investigated the professional dashboard and related profile routes, including `app/professionals/[id]/page.tsx`, `app/profile/page.tsx`, `app/actions/professional.ts`, `app/api/profiles/route.ts`, and `components/profile/ProfessionalProfilePage.tsx`.
2. Added or improved profile bootstrap logic so professional rows are created with ownership fields intact.
3. Kept the server-side fallback behavior for professional/profile fetching so missing rows can still render from auth metadata where possible.
4. Updated the dashboard save path to upsert `professionals` and `profiles` consistently.
5. Added explicit loading/saving/uploading UI states so the dashboard no longer appears dead during requests.
6. Added a local session cleanup path for invalid compact JWS auth failures.
7. Rebuilt and validated the app after the final dashboard UX pass.

## Files Changed or Touched

- `app/api/profiles/route.ts` — profile bootstrap endpoint; now writes `user_id` along with `id`.
- `components/profile/ProfessionalProfilePage.tsx` — dashboard UI and save/upload flows; now shows in-flight feedback and uses the correct ownership fields.
- `app/professionals/[id]/page.tsx` — public professional profile lookup.
- `app/profile/page.tsx` — profile route wrapper that renders the dashboard.
- `app/actions/professional.ts` — professional lookup helpers and fallback behavior.
- `components/auth/useAuthUser.ts` — safer auth initialization and loading cleanup.
- `components/auth/useAuthUser.ts` — invalid compact JWS cleanup and safer auth initialization.
- `components/landing/professionals-browser.tsx` — search and fallback improvements.
- `components/LoaderProvider.jsx` and `components/FramebookLoader.jsx` — hydration/loading behavior cleanup.

## Validation

- `npm run build` passes successfully.
- The final pushed commit is `cee7ef8` with message `Fix professional dashboard save and upload feedback`.

## Current Notes

- The dashboard now gives clear feedback while uploading or saving, which should make the UI behavior much easier to trust.
- The remaining risk area is still Supabase environment and policy configuration, not the dashboard code path itself.

## How To Test

1. Start the app locally:
   ```bash
   npm install
   npm run dev
   ```
2. Open `http://localhost:3000/profile` and sign in as a professional account.
3. Try:
   - Editing the bio and saving it.
   - Uploading an avatar.
   - Uploading media items.
   - Saving profile details from the edit modal.

If a save or upload fails, the action now stays visibly tied to its own busy state instead of leaving the page looking stuck.

---

Report updated by the development agent after the latest dashboard fix and push.
