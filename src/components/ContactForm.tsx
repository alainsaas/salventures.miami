import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, X, Loader2 } from "lucide-react";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES: Record<string, string> = {
  "application/pdf": ".pdf",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx",
  "application/vnd.apple.keynote": ".key",
  "application/x-iwork-keynote-sffkey": ".key",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
};
const ACCEPT_ATTR = ".pdf,.pptx,.key,.docx";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Valid email required").max(255),
  company: z.string().trim().max(150).optional(),
  message: z.string().trim().min(10, "Message is too short").max(3000),
  sendDeck: z.boolean(),
});

export const ContactForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [sendDeck, setSendDeck] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File | null) => {
    if (!f) {
      setFile(null);
      return;
    }
    const ext = "." + (f.name.split(".").pop()?.toLowerCase() ?? "");
    const okExt = [".pdf", ".pptx", ".key", ".docx"].includes(ext);
    if (!okExt) {
      toast.error("File must be PDF, PPTX, Keynote, or DOCX");
      return;
    }
    if (f.size > MAX_FILE_BYTES) {
      toast.error("File must be 5 MB or smaller");
      return;
    }
    setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypotRef.current?.value) return;

    const parsed = schema.safeParse({ name, email, company, message, sendDeck });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message ?? "Please check the form");
      return;
    }
    if (sendDeck && !file) {
      toast.error("Please attach your pitch deck or uncheck the option");
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", parsed.data.name);
      fd.append("email", parsed.data.email);
      if (parsed.data.company) fd.append("company", parsed.data.company);
      fd.append("message", parsed.data.message);
      fd.append("sendDeck", String(sendDeck));
      if (sendDeck && file) fd.append("deck", file);

      const { data, error } = await supabase.functions.invoke("send-contact-message", {
        body: fd,
      });
      if (error) throw error;
      if (data && (data as any).error) throw new Error((data as any).error);

      toast.success("Thanks, your message is on its way.");
      setName("");
      setEmail("");
      setCompany("");
      setMessage("");
      setSendDeck(false);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      toast.error(err?.message ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="w-full max-w-2xl mx-auto"
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-6 md:p-8"
      >
        <h2 className="text-2xl font-semibold tracking-tight">Get in touch</h2>

        {/* honeypot */}
        <input
          ref={honeypotRef}
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden="true"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cf-name">Name</Label>
            <Input id="cf-name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cf-email">Email</Label>
            <Input id="cf-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cf-company">Company <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Input id="cf-company" value={company} onChange={(e) => setCompany(e.target.value)} maxLength={150} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cf-message">Message</Label>
          <Textarea
            id="cf-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={5}
            maxLength={3000}
          />
        </div>

        <div className="flex items-start gap-3 pt-1">
          <Checkbox
            id="cf-deck"
            checked={sendDeck}
            onCheckedChange={(v) => {
              const next = Boolean(v);
              setSendDeck(next);
              if (!next) setFile(null);
            }}
          />
          <Label htmlFor="cf-deck" className="font-normal cursor-pointer leading-snug">
            Send us your pitch deck
          <span className="block text-xs text-muted-foreground mt-1">
            PDF, PPTX, Keynote or DOCX. Up to 5 MB
          </span>
          </Label>
        </div>

        {sendDeck && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            {!file ? (
              <label
                htmlFor="cf-file"
                className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/80 bg-background/40 px-4 py-6 cursor-pointer hover:border-primary/60 transition-colors"
              >
                <Upload className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-foreground/80">Click to choose your deck</span>
                <span className="text-xs text-muted-foreground">{ACCEPT_ATTR.split(",").join(" · ")}</span>
                <input
                  id="cf-file"
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPT_ATTR}
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                />
              </label>
            ) : (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-border/80 bg-background/40 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </motion.div>
        )}

        <Button type="submit" disabled={submitting} className="w-full md:w-auto">
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending…
            </>
          ) : (
            "Let's talk"
          )}
        </Button>
      </form>
    </motion.div>
  );
};

export default ContactForm;
