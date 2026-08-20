import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { SocietyLogo } from "@/components/common/SocietyLogo";
import { AppHeader } from "@/components/layout/AppHeader";
import { MobileShell } from "@/components/layout/MobileShell";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";

const searchSchema = z.object({ mobile: z.string().optional() });

export const Route = createFileRoute("/otp")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Verify OTP — Green Valley Society" },
      { name: "description", content: "Enter the 6-digit verification code sent to your mobile number." },
      { property: "og:title", content: "Verify OTP — Green Valley Society" },
      { property: "og:description", content: "Confirm your identity with the one-time code." },
    ],
  }),
  component: OtpScreen,
});

const RESEND_SECONDS = 30;

function OtpScreen() {
  const { mobile } = Route.useSearch();
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (!mobile) navigate({ to: "/login", replace: true });
  }, [mobile, navigate]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  async function handleVerify(event?: FormEvent) {
    event?.preventDefault();
    if (!mobile) return;
    setError(null);
    setLoading(true);
    const result = await authService.verifyOtp(mobile, otp);
    setLoading(false);
    if (!result.ok || !result.data) {
      setError(result.error ?? "Verification failed. Please try again.");
      setOtp("");
      return;
    }
    setSession(result.data);
    toast.success(`Welcome back, ${result.data.user.name.split(" ")[0]}`);
    navigate({ to: "/dashboard", replace: true });
  }

  async function handleResend() {
    if (!mobile) return;
    const result = await authService.requestOtp(mobile);
    if (!result.ok) {
      toast.error(result.error ?? "Could not resend OTP.");
      return;
    }
    setSeconds(RESEND_SECONDS);
    toast.success("OTP resent", { description: "Use 123456 for this prototype." });
  }

  return (
    <MobileShell>
      <AppHeader title="Verify OTP" showBack />
      <main className="flex flex-1 flex-col px-6 pb-10 pt-8">
        <div className="flex flex-col items-center text-center">
          <SocietyLogo />
          <h1 className="mt-4 text-lg font-semibold text-foreground">Enter verification code</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sent to +91 {mobile ?? ""}
          </p>
        </div>

        <form onSubmit={handleVerify} className="mt-8 flex flex-col items-center gap-4">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(value) => {
              setOtp(value);
              setError(null);
            }}
            aria-label="6 digit OTP"
          >
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot key={i} index={i} className="h-12 w-11 text-lg" />
              ))}
            </InputOTPGroup>
          </InputOTP>

          {error && <p className="text-sm font-medium text-destructive">{error}</p>}

          <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl text-base">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Verifying…" : "Verify & continue"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            disabled={seconds > 0}
            onClick={handleResend}
            className="h-11 w-full rounded-xl"
          >
            {seconds > 0 ? `Resend OTP in ${seconds}s` : "Resend OTP"}
          </Button>
        </form>
      </main>
    </MobileShell>
  );
}
