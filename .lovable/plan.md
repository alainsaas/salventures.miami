## Goal
Make the site fully static — no Supabase client, no edge function calls, no backend env vars required to build/run.

## Changes

1. **`src/pages/Index.tsx`** — remove the commented-out `ContactForm` import and the commented contact section (dead code referencing a Supabase-dependent component).

2. **`src/pages/Unsubscribe.tsx`** — replace the Supabase-backed unsubscribe flow with a static message ("Unsubscribe requests are no longer processed here — email us instead" or similar neutral copy). Keep the page/route so old links don't 404. Remove the `supabase` import and the `functions.invoke` call.

3. **`src/components/ContactForm.tsx`** — delete the file (no longer imported anywhere).

4. **`src/integrations/supabase/client.ts` and `src/integrations/supabase/types.ts`** — delete. Nothing else imports them after step 1–3.

5. **`package.json`** — remove the `@supabase/supabase-js` dependency.

6. **`.env`** — remove `VITE_SUPABASE_*` variables (no longer read by any code).

7. **`supabase/`** folder (config.toml + any functions) — leave on disk untouched (not shipped in the static build), OR delete if you want a clean repo. Recommend deleting for clarity.

## Result
- `npm run build` produces a fully static `dist/` that can be hosted on any static file host (GitHub Pages, Netlify drop, S3, plain nginx) with zero backend.
- No network calls to Supabase from the client.
- `/` and `/unsubscribe` routes still work; `/unsubscribe` shows a static notice.

## Open question
Should the `supabase/` folder and the edge functions inside it be deleted from the repo too, or kept as reference?
