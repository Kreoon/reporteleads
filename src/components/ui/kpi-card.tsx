import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "primary" | "success" | "warning";
  className?: string;
}

const variantStyles = {
  default: "glass-card",
  primary: "gradient-primary text-primary-foreground glow-primary",
  success: "glass-card border-l-4 border-l-[hsl(var(--success))]",
  warning: "glass-card border-l-4 border-l-[hsl(var(--warning))]",
};

export function KPICard({ title, value, icon: Icon, trend, variant = "default", className }: KPICardProps) {
  return (
    <div className={cn(
      "rounded-xl p-6 transition-all duration-300 hover:scale-[1.02]",
      variantStyles[variant],
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className={cn(
            "text-sm font-medium",
            variant === "primary" ? "text-primary-foreground/80" : "text-muted-foreground"
          )}>
            {title}
          </p>
          <p className={cn(
            "text-3xl font-bold tracking-tight",
            variant === "primary" ? "text-primary-foreground" : "text-foreground"
          )}>
            {value}
          </p>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-sm font-medium",
              trend.isPositive ? "text-[hsl(var(--success))]" : "text-destructive"
            )}>
              <span>{trend.isPositive ? "↑" : "↓"}</span>
              <span>{Math.abs(trend.value)}% vs ayer</span>
            </div>
          )}
        </div>
        <div className={cn(
          "p-3 rounded-lg",
          variant === "primary" ? "bg-white/20" : "bg-secondary"
        )}>
          <Icon className={cn(
            "w-6 h-6",
            variant === "primary" ? "text-primary-foreground" : "text-primary"
          )} />
        </div>
      </div>
    </div>
  );
}
