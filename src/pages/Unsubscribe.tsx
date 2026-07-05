import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type State =
  | { kind: "loading" }
  | { kind: "ready" }
  | { kind: "already" }
  | { kind: "invalid" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; message: string };

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

const Unsubscribe = () => {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    if (!token) {
      setState({ kind: "invalid" });
      return;
    }
    (async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`,
          { headers: { apikey: SUPABASE_ANON_KEY } },
        );
        const data = await res.json();
        if (!res.ok) {
          setState({ kind: "invalid" });
          return;
        }
        if (data.reason === "already_unsubscribed") {
          setState({ kind: "already" });
          return;
        }
        if (data.valid) {
          setState({ kind: "ready" });
        } else {
          setState({ kind: "invalid" });
        }
      } catch {
        setState({ kind: "error", message: "Could not validate your link." });
      }
    })();
  }, [token]);

  const confirm = async () => {
    if (!token) return;
    setState({ kind: "submitting" });
    try {
      const { data, error } = await supabase.functions.invoke(
        "handle-email-unsubscribe",
        { body: { token } },
      );
      if (error) throw error;
      if (data?.success) setState({ kind: "success" });
      else if (data?.reason === "already_unsubscribed") setState({ kind: "already" });
      else setState({ kind: "error", message: "Something went wrong." });
    } catch {
      setState({ kind: "error", message: "Something went wrong." });
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-foreground mb-3">Unsubscribe</h1>

        {state.kind === "loading" && (
          <p className="text-muted-foreground">Validating your link…</p>
        )}

        {state.kind === "ready" && (
          <>
            <p className="text-muted-foreground mb-6">
              Click below to confirm and stop receiving emails from salventures.miami.
            </p>
            <Button onClick={confirm} className="w-full">
              Confirm unsubscribe
            </Button>
          </>
        )}

        {state.kind === "submitting" && (
          <p className="text-muted-foreground">Processing…</p>
        )}

        {state.kind === "success" && (
          <p className="text-foreground">
            You've been unsubscribed. You won't receive further emails from us.
          </p>
        )}

        {state.kind === "already" && (
          <p className="text-muted-foreground">
            This email address is already unsubscribed.
          </p>
        )}

        {state.kind === "invalid" && (
          <p className="text-muted-foreground">
            This unsubscribe link is invalid or has expired.
          </p>
        )}

        {state.kind === "error" && (
          <p className="text-destructive">{state.message}</p>
        )}
      </div>
    </main>
  );
};

export default Unsubscribe;
