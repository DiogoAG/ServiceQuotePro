
import { DashboardNav } from "@/components/dashboard-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <DashboardNav />
      <main className="flex-1 md:ml-64 p-4 md:p-8 lg:p-12 overflow-y-auto no-print">
        {children}
      </main>
      <div className="print-only w-full">
        {children}
      </div>
    </div>
  );
}
