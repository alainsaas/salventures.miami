
-- Contact submissions: allow anonymous inserts, restrict reads to authenticated staff
CREATE POLICY "Anyone can submit contact form"
  ON public.contact_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view submissions"
  ON public.contact_submissions FOR SELECT
  TO authenticated
  USING (true);

-- Pitch decks storage policies (private bucket)
CREATE POLICY "Anyone can upload pitch decks"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'pitch-decks');

CREATE POLICY "Authenticated users can read pitch decks"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'pitch-decks');
