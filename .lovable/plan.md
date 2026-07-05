# Contact form with optional pitch deck

## Decisions locked in
- Email provider: **Lovable's built-in email infrastructure** (no third-party connector).
- Accepted deck formats: **PDF, PPTX, Keynote (.key), DOCX**, max **5 MB**.
- Sender address: **miami@salventures.miami**.
- Recipients: alain@, salima@, laura@getunlockd.ai (all three on every submission).

## Important constraint
Lovable's built-in email does **not** support file attachments. The pitch deck will be uploaded to Lovable Cloud Storage (private bucket), and the email will include a **signed download link** valid for 30 days. This is the standard pattern and keeps everything inside Lovable Cloud.

## Backend setup (Lovable Cloud)
1. Enable Lovable Cloud.
2. Set up email infrastructure + verify domain `salventures.miami` (so `miami@salventures.miami` can send). Until DNS verifies, emails queue and start flowing once DNS is green.
3. Create a private storage bucket `pitch-decks`.
4. Create table `contact_submissions` to log every message (name, email, company, message, has_deck, deck_path, created_at) with RLS — inserts done by edge function via service role, no public read.
5. Edge function `send-contact-message`:
   - Accepts `multipart/form-data` (name, email, company optional, message, sendDeck flag, file optional).
   - Server-side Zod validation (lengths, email, allowed mime types, 5 MB cap), honeypot check, basic rate-limit by IP.
   - If file present: upload to `pitch-decks/{uuid}-{filename}`, create 30-day signed URL.
   - Insert row in `contact_submissions`.
   - Send **one** transactional email via Lovable Emails to all three recipients with: submitter name/email/company, full message, and (if applicable) the signed deck link + filename + size. `Reply-To` = submitter's email.
   - Send a short confirmation email to the submitter.
   - Returns `{ ok: true }` or structured error.

## Frontend
New section under the existing content on `src/pages/Index.tsx`, introduced with the copy you provided:

> We are entering a world where intelligence is ubiquitous. The post-execution economy is coming, and companies will be fundamentally different.
> - When execution is no longer the bottleneck, how would you invest a million dollars of funding for your new startup?
> - With AI tools supporting work, how do you redefine roles and scopes for both individuals and leadership?
> - What's the new fundamental mechanism that will compound advantage over time, now that traditional moats are falling and markets are getting crowded with cheaply built competition?
>
> If you have answers, we would love to hear from you. Please get in touch.

New component `src/components/ContactForm.tsx`:
- Fields: Name, Email, Company (optional), Message.
- Checkbox: **"Send us your pitch deck"** — when checked, reveals a file input (PDF, PPTX, KEY, DOCX, up to 5 MB) with drag-and-drop, filename + size preview, remove button.
- Hidden honeypot field.
- Client-side Zod validation matching server.
- Submit calls the edge function, shows success/error toast, resets form.
- Styled with existing design tokens (no hardcoded colors), matches the site's typography and spacing.

## Copy choice
Using **"pitch deck"** (clearer than "pitch") on both the checkbox and the file picker label.

## Open items
None — ready to build on approval.
