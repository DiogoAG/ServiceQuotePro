
"use client";

import { useState } from "react";
import { DashboardNav } from "@/components/dashboard-nav";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isFolded, setIsFolded] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <DashboardNav isFolded={isFolded} onToggleFold={() => setIsFolded(!isFolded)} />
      <main className={cn(
        "flex-1 transition-all duration-300 p-4 md:p-8 lg:p-12 overflow-y-auto no-print",
        isFolded ? "md:ml-20" : "md:ml-64"
      )}>
        {children}
      </main>
      <div className="print-only w-full">
        {children}
      </div>
    </div>
  );
}
