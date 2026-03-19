
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconClassName?: string;
}

export function Logo({ className, iconClassName }: LogoProps) {
  return (
    <div className={cn(
      "w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0 shadow-sm",
      className
    )}>
      <FileText className={cn("text-white w-5 h-5", iconClassName)} />
    </div>
  );
}
