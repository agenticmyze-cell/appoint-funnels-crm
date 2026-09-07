import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PanelsTopLeft } from "lucide-react";
import brandLogo from "@/assets/appoint-funnels-logo.png.asset.json";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Appoint Funnels CRM" },
      {
        name: "description",
        content:
          "Sign in to Appoint Funnels CRM to manage cold email campaigns, leads, replies and client results.",
      },
      { property: "og:title", content: "Sign in — Appoint Funnels CRM" },
      {
        property: "og:description",
        content: "Access your agency dashboard, campaigns and client reporting.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard", replace: true });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        if (data.session) navigate({ to: "/dashboard", replace: true });
        else toast.success("Check your email to confirm your account.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-2">
          <img
            src={brandLogo.url}
            alt="Appoint Funnels CRM logo"
            className="size-8 rounded-md object-contain"
          />
          <div className="leading-tight">
            <div className="text-[13px] font-bold tracking-tight">APPOINT FUNNELS</div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              CRM
            </div>
          </div>
        </div>

        <div className="panel p-5">
          <h1 className="text-[17px] font-semibold tracking-tight">
            {mode === "signin" ? "Sign in to your workspace" : "Create your account"}
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Campaigns, leads, replies and client reporting in one place.
          </p>

          <form onSubmit={submit} className="mt-4 space-y-3">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Full name</Label>
                <Input
                  className="h-9"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Morgan"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold">Work email</Label>
              <Input
                className="h-9"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@agency.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold">Password</Label>
              <Input
                className="h-9"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <div className="my-4 flex items-center gap-3 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="w-full" onClick={google}>
            Continue with Google
          </Button>

          <p className="mt-4 text-center text-[12px] text-muted-foreground">
            {mode === "signin" ? "New to Appoint Funnels?" : "Already have an account?"}{" "}
            <button
              type="button"
              className="font-semibold text-primary"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
