import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const RECIPIENTS = ["alain@getunlockd.ai", "salima@getunlockd.ai", "laura@getunlockd.ai"];
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXT = new Set(["pdf", "pptx", "key", "docx"]);

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const form = await req.formData();
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const company = String(form.get("company") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();
    const sendDeck = String(form.get("sendDeck") ?? "false") === "true";
    const deck = form.get("deck");

    if (!name || name.length > 100) return json(400, { error: "Invalid name" });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255)
      return json(400, { error: "Invalid email" });
    if (company.length > 150) return json(400, { error: "Invalid company" });
    if (message.length < 10 || message.length > 3000)
      return json(400, { error: "Message must be between 10 and 3000 characters" });

    let deckPath: string | null = null;
    let deckFilename: string | null = null;
    let deckSize: number | null = null;
    let deckSignedUrl: string | null = null;

    if (sendDeck) {
      if (!(deck instanceof File)) return json(400, { error: "Pitch deck file missing" });
      if (deck.size > MAX_FILE_BYTES) return json(400, { error: "File exceeds 5 MB" });
      const ext = (deck.name.split(".").pop() ?? "").toLowerCase();
      if (!ALLOWED_EXT.has(ext)) return json(400, { error: "Unsupported file type" });

      const safeName = deck.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
      deckPath = `${crypto.randomUUID()}-${safeName}`;
      deckFilename = deck.name;
      deckSize = deck.size;

      const { error: upErr } = await supabase.storage
        .from("pitch-decks")
        .upload(deckPath, deck, {
          contentType: deck.type || "application/octet-stream",
          upsert: false,
        });
      if (upErr) {
        console.error("Upload error", upErr);
        return json(500, { error: "Failed to store pitch deck" });
      }

      const { data: signed, error: signErr } = await supabase.storage
        .from("pitch-decks")
        .createSignedUrl(deckPath, 60 * 60 * 24 * 30); // 30 days
      if (signErr || !signed) {
        console.error("Sign error", signErr);
        return json(500, { error: "Failed to create download link" });
      }
      deckSignedUrl = signed.signedUrl;
    }

    // Log to DB
    const { error: dbErr } = await supabase.from("contact_submissions").insert({
      name,
      email,
      company: company || null,
      message,
      has_deck: !!deckPath,
      deck_path: deckPath,
      deck_filename: deckFilename,
      deck_size_bytes: deckSize,
    });
    if (dbErr) console.error("DB insert error", dbErr);

    // Build email body
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br/>");
    const deckBlock = deckSignedUrl
      ? `<p style="margin:24px 0 8px"><strong>Pitch deck:</strong> ${escapeHtml(deckFilename!)} (${(deckSize! / 1024 / 1024).toFixed(2)} MB)</p>
         <p style="margin:0 0 24px"><a href="${deckSignedUrl}" style="color:#14b8a6">Download deck</a> — link valid for 30 days.</p>`
      : "";

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a">
        <h2 style="margin:0 0 16px">New message from salventures.miami</h2>
        <p style="margin:4px 0"><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
        ${company ? `<p style="margin:4px 0"><strong>Company:</strong> ${escapeHtml(company)}</p>` : ""}
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0"/>
        <p style="white-space:pre-wrap;line-height:1.6">${safeMessage}</p>
        ${deckBlock}
      </div>`;

    const text =
      `New message from salventures.miami\n\n` +
      `From: ${name} <${email}>\n` +
      (company ? `Company: ${company}\n` : "") +
      `\n${message}\n` +
      (deckSignedUrl
        ? `\nPitch deck: ${deckFilename} (${(deckSize! / 1024 / 1024).toFixed(2)} MB)\nDownload (valid 30 days): ${deckSignedUrl}\n`
        : "");

    // Send via Lovable transactional email function (one invoke per recipient)
    const submissionId = crypto.randomUUID();
    const templateData = {
      name,
      email,
      company: company || null,
      message,
      deckFilename,
      deckSizeMB: deckSize ? (deckSize / 1024 / 1024).toFixed(2) : null,
      deckSignedUrl,
    };

    await Promise.all(
      RECIPIENTS.map(async (recipient) => {
        try {
          const { error: emailErr } = await supabase.functions.invoke(
            "send-transactional-email",
            {
              body: {
                templateName: "contact-message",
                recipientEmail: recipient,
                idempotencyKey: `contact-${submissionId}-${recipient}`,
                replyTo: email,
                templateData,
              },
            },
          );
          if (emailErr) console.error("Email send error", recipient, emailErr);
        } catch (e) {
          console.error("Email invoke failed", recipient, e);
        }
      }),
    );

    return json(200, { ok: true });
  } catch (err) {
    console.error("Unhandled error", err);
    return json(500, { error: "Unexpected error" });
  }
});
