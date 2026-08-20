import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { SocietyLogo } from "@/components/common/SocietyLogo";
import { MobileShell } from "@/components/layout/MobileShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { ROLE_LABEL } from "@/lib/permissions";
import { authService } from "@/services/authService";
import { ALL_ROLES, type Role } from "@/types/domain";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Green Valley Society" },
      { name: "description", content: "Sign in with your registered society mobile number to continue." },
      { property: "og:title", content: "Sign in — Green Valley Society" },
      { property: "og:description", content: "Secure OTP sign in for Green Valley Society members." },
    ],
  }),
  component: LoginScreen,
});

function LoginScreen() {
  const navigate = useNavigate();
  const { isReady, isAuthenticated, setSession } = useAuth();
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<Role | null>(null);

  useEffect(() => {
    if (isReady && isAuthenticated) navigate({ to: "/dashboard", replace: true });
  }, [isReady, isAuthenticated, navigate]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const result = await authService.requestOtp(mobile);
    setLoading(false);
    if (!result.ok || !result.data) {
      setError(result.error ?? "Something went wrong. Please try again.");
      return;
    }
    toast.success("OTP sent", { description: "Use 123456 for this prototype." });
    navigate({ to: "/otp", search: { mobile: result.data.mobile } });
  }

  async function handleDemo(role: Role) {
    setDemoLoading(role);
    const result = await authService.demoLogin(role);
    setDemoLoading(null);
    if (!result.ok || !result.data) {
      toast.error(result.error ?? "Demo login failed.");
      return;
    }
    setSession(result.data);
    toast.success(`Signed in as ${ROLE_LABEL[role]}`);
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <MobileShell>
      <main className="flex flex-1 flex-col px-6 pb-10 pt-14">
        <div className="flex flex-col items-center text-center">
          <SocietyLogo size="lg" />
          <h1 className="mt-4 text-xl font-semibold text-foreground">Green Valley Society</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in with your registered mobile number</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile number</Label>
            <div className="flex items-center gap-2">
              <span className="flex h-12 items-center rounded-xl border border-input px-3 text-sm text-muted-foreground">
                +91
              </span>
              <Input
                id="mobile"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="10-digit number"
                value={mobile}
                aria-invalid={!!error}
                aria-describedby={error ? "mobile-error" : undefined}
                onChange={(e) => {
                  setMobile(e.target.value.replace(/\D/g, "").slice(0, 10));
                  setError(null);
                }}
                className="h-12 flex-1 rounded-xl text-base"
              />
            </div>
            {error && (
              <p id="mobile-error" className="text-sm font-medium text-destructive">
                {error}
              </p>
            )}
          </div>

          <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl text-base">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Sending OTP…" : "Send OTP"}
          </Button>
        </form>

        <div className="mt-10">
          <p className="text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Demo login
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {ALL_ROLES.map((role) => (
              <Button
                key={role}
                type="button"
                variant="outline"
                disabled={demoLoading !== null}
                onClick={() => handleDemo(role)}
                className="h-11 rounded-xl text-sm"
              >
                {demoLoading === role && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Continue as {ROLE_LABEL[role]}
              </Button>
            ))}
          </div>
        </div>
      </main>
    </MobileShell>
  );
}
