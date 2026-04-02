"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  PlusCircle,
  Menu,
  X,
  LogOut,
  Copy,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Logo } from "@/components/logo";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Quotes", href: "/quotes", icon: FileText },
  { name: "Templates", href: "/templates", icon: Copy },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface DashboardNavProps {
  isFolded?: boolean;
  onToggleFold?: () => void;
}

export function DashboardNav({ isFolded = false, onToggleFold }: DashboardNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <TooltipProvider delayDuration={0}>
      {/* Mobile Toggle */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-card sticky top-0 z-50">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Logo />
          <span className="font-bold text-xl tracking-tight text-primary whitespace-nowrap">ServiceQuotePro</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 bg-card border-r flex flex-col transition-all duration-300 transform md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
        isFolded ? "w-20" : "w-64"
      )}>
        <div className={cn("p-6", isFolded ? "px-4 flex justify-center" : "")}>
          <Link href="/dashboard" className="flex items-center gap-3">
            <Logo />
            {!isFolded && (
              <span className="font-bold text-xl tracking-tight text-primary whitespace-nowrap">ServiceQuotePro</span>
            )}
          </Link>
        </div>

        <div className={cn("px-4 py-2 flex-1 space-y-2", isFolded ? "px-2" : "")}>
          <Link href="/quotes/new">
            {isFolded ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button className="w-full justify-center p-0 h-12 shadow-md mb-6" size="icon">
                    <PlusCircle className="w-6 h-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">New Quote</TooltipContent>
              </Tooltip>
            ) : (
              <Button className="w-full justify-start gap-2 mb-6 shadow-md" size="lg">
                <PlusCircle className="w-5 h-5" />
                New Quote
              </Button>
            )}
          </Link>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const content = (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    isFolded ? "justify-center px-2" : ""
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {!isFolded && <span>{item.name}</span>}
                </Link>
              );

              return isFolded ? (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{content}</TooltipTrigger>
                  <TooltipContent side="right">{item.name}</TooltipContent>
                </Tooltip>
              ) : content;
            })}
          </nav>
        </div>

        <div className="p-4 border-t space-y-2">
          {onToggleFold && (
            <Button 
              variant="ghost" 
              className={cn("w-full justify-start gap-3 text-muted-foreground hidden md:flex", isFolded ? "justify-center px-0" : "")}
              onClick={onToggleFold}
            >
              {isFolded ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              {!isFolded && <span>Collapse</span>}
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            className={cn("w-full justify-start gap-3 text-muted-foreground hover:text-destructive", isFolded ? "justify-center px-0" : "")}
            onClick={handleSignOut}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isFolded && <span>Sign Out</span>}
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
    </TooltipProvider>
  );
}
