
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;

CREATE POLICY "Anyone can submit contact form"
ON public.contact_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(btrim(name)) BETWEEN 1 AND 100
  AND length(email) BETWEEN 3 AND 255
  AND email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'
  AND length(message) BETWEEN 10 AND 3000
  AND (company IS NULL OR length(company) <= 150)
);
