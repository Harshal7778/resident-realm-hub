import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { SocietyLogo } from "@/components/common/SocietyLogo";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Society Management — Green Valley Society" },
      {
        name: "description",
        content:
          "Mobile app for Green Valley Society members: events, payments, meetings, notices and inventory in one place.",
      },
      { property: "og:title", content: "Society Management — Green Valley Society" },
      {
        property: "og:description",
        content: "Manage your housing society from your phone: events, payments, meetings and notices.",
      },
    ],
  }),
  component: SplashScreen,
});

function SplashScreen() {
  const { isReady, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isReady) return;
    const timer = setTimeout(() => {
      navigate({ to: isAuthenticated ? "/dashboard" : "/login", replace: true });
    }, 1200);
    return () => clearTimeout(timer);
  }, [isReady, isAuthenticated, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-primary px-6 text-center">
      <div className="animate-in fade-in zoom-in-95 duration-500">
        <SocietyLogo size="lg" className="bg-primary-foreground text-primary" />
      </div>
      <div className="animate-in fade-in duration-700">
        <h1 className="text-xl font-semibold text-primary-foreground">Society Management</h1>
        <p className="mt-1 text-sm text-primary-foreground/80">Green Valley Society</p>
      </div>
    </div>
  );
}
