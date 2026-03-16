
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  PlusCircle,
  Menu,
  X,
  LogOut,
  Copy
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Quotes", href: "/quotes", icon: FileText },
  { name: "Templates", href: "/templates", icon: Copy },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function DashboardNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <FileText className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">ServiceQuotePro</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r flex flex-col transition-transform duration-300 transform md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg">
              <FileText className="text-white w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight text-primary">ServiceQuotePro</span>
          </Link>
        </div>

        <div className="px-4 py-2 flex-1 space-y-2">
          <Link href="/quotes/new">
            <Button className="w-full justify-start gap-2 mb-6 shadow-md" size="lg">
              <PlusCircle className="w-5 h-5" />
              New Quote
            </Button>
          </Link>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                    pathname === item.href 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive">
            <LogOut className="w-5 h-5" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
