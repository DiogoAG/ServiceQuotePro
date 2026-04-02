"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardNav } from "@/components/dashboard-nav";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isFolded, setIsFolded] = useState(false);
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <div className="no-print h-full shrink-0">
        <DashboardNav isFolded={isFolded} onToggleFold={() => setIsFolded(!isFolded)} />
      </div>
      <main className={cn(
        "flex-1 transition-all duration-300 p-4 md:p-8 lg:p-12 overflow-y-auto",
        isFolded ? "md:ml-20" : "md:ml-64",
        "print:m-0 print:p-0 print:overflow-visible"
      )}>
        {children}
      </main>
    </div>
  );
}