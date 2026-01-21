import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "primary" | "success" | "warning";
  description?: string;
  className?: string;
}

const variantStyles = {
  default: "glass-card",
  primary: "gradient-primary text-primary-foreground glow-primary",
  success: "glass-card border-l-4 border-l-[hsl(var(--success))]",
  warning: "glass-card border-l-4 border-l-[hsl(var(--warning))]",
};

export function KPICard({ title, value, icon: Icon, trend, variant = "default", description, className }: KPICardProps) {
  return (
    <div className={cn(
      "rounded-xl p-5 transition-all duration-300 hover:scale-[1.02]",
      variantStyles[variant],
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className={cn(
            "text-xs font-medium uppercase tracking-wide",
            variant === "primary" ? "text-primary-foreground/80" : "text-muted-foreground"
          )}>
            {title}
          </p>
          <p className={cn(
            "text-2xl font-bold tracking-tight",
            variant === "primary" ? "text-primary-foreground" : "text-foreground"
          )}>
            {value}
          </p>
          {description && (
            <p className={cn(
              "text-xs",
              variant === "primary" ? "text-primary-foreground/70" : "text-muted-foreground"
            )}>
              {description}
            </p>
          )}
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium",
              trend.isPositive ? "text-[hsl(var(--success))]" : "text-destructive"
            )}>
              <span>{trend.isPositive ? "↑" : "↓"}</span>
              <span>{Math.abs(trend.value)}% vs ayer</span>
            </div>
          )}
        </div>
        <div className={cn(
          "p-2.5 rounded-lg",
          variant === "primary" ? "bg-white/20" : "bg-secondary"
        )}>
          <Icon className={cn(
            "w-5 h-5",
            variant === "primary" ? "text-primary-foreground" : "text-primary"
          )} />
        </div>
      </div>
    </div>
  );
}
