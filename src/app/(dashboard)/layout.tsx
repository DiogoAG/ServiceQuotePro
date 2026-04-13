"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { DashboardNav } from "@/components/dashboard-nav";
import { cn } from "@/lib/utils";
import { useUser, useAuth, useFirestore } from "@/firebase";
import { Loader2, Sparkles, X, RefreshCcw } from "lucide-react";
import { useDemoMode } from "@/lib/demo/use-demo-mode";
import { Button } from "@/components/ui/button";
import { signOut } from "firebase/auth";
import { seedDemoEnvironment } from "@/lib/demo/seed-demo-data";
import { useToast } from "@/hooks/use-toast";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const [isFolded, setIsFolded] = useState(false);
  const { user, isUserLoading } = useUser();
  const { isDemoMode, exitDemoMode } = useDemoMode();
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  // CRITICAL: Interaction Safety Valve
  // Force reset body interaction styles that Shadcn/Radix sometimes leave behind
  useEffect(() => {
    const recoverInteraction = () => {
      if (typeof document !== 'undefined') {
        // Ensure buttons are always clickable
        document.body.style.pointerEvents = "auto";
        // Only reset overflow if we aren't inside an active intended lock
        // but for a dashboard layout, auto is almost always the correct state
        document.body.style.overflow = "auto";
      }
    };

    recoverInteraction();
    
    // Also run on a slight delay to catch any post-animation locks
    const timer = setTimeout(recoverInteraction, 300);
    
    // Polling recovery: ensures UI remains clickable even after interrupted modal animations
    const interval = setInterval(recoverInteraction, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [pathname]);

  const handleExitDemo = async () => {
    exitDemoMode();
    await signOut(auth);
    router.push("/login");
  };

  const handleResetDemo = async () => {
    if (!user) return;
    setIsResetting(true);
    try {
      await seedDemoEnvironment(db, user.uid);
      toast({ title: "Demo Data Reset", description: "The environment has been restored to its original state." });
      window.location.reload();
    } finally {
      setIsResetting(false);
    }
  };

  if (isUserLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-background flex flex-col"
      style={{ "--banner-height": isDemoMode ? "40px" : "0px" } as React.CSSProperties}
    >
      {/* Demo Banner */}
      {isDemoMode && (
        <div className="sticky top-0 left-0 right-0 z-[110] bg-accent text-accent-foreground px-4 py-2 flex items-center justify-between no-print shadow-md h-10">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent-foreground">
            <Sparkles className="w-3.5 h-3.5" />
            Live Demo Mode
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-[10px] gap-1.5 font-black uppercase hover:bg-white/20 text-accent-foreground"
              onClick={handleResetDemo}
              disabled={isResetting}
            >
              {isResetting ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCcw className="w-3 h-3" />}
              Reset Data
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-[10px] gap-1.5 font-black uppercase hover:bg-white/20 text-accent-foreground"
              onClick={handleExitDemo}
            >
              <X className="w-3 h-3" />
              Exit Demo
            </Button>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col md:flex-row relative">
        <div className="no-print h-full shrink-0">
          <DashboardNav isFolded={isFolded} onToggleFold={() => setIsFolded(!isFolded)} />
        </div>
        <main className={cn(
          "flex-1 transition-all duration-300 p-4 md:p-8 lg:p-12 overflow-y-auto",
          "print:m-0 print:p-0 print:overflow-visible print:transition-none",
          isFolded ? "md:ml-20" : "md:ml-64",
          "print:ml-0"
        )}>
          {children}
        </main>
      </div>
    </div>
  );
}
