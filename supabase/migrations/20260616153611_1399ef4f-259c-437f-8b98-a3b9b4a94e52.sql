
-- 1. Contact submissions: drop the permissive SELECT, only service_role can read
DROP POLICY IF EXISTS "Authenticated users can view submissions" ON public.contact_submissions;

CREATE POLICY "Service role can read submissions"
ON public.contact_submissions
FOR SELECT
TO public
USING (auth.role() = 'service_role');

-- 2. Pitch decks storage: restrict reads to service_role; keep uploads working but safer
DROP POLICY IF EXISTS "Authenticated users can read pitch decks" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload pitch decks" ON storage.objects;

CREATE POLICY "Service role can read pitch decks"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'pitch-decks' AND auth.role() = 'service_role');

CREATE POLICY "Anyone can upload pitch decks"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'pitch-decks');
