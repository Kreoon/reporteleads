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
  compact?: boolean;
}

const variantStyles = {
  default: "glass-card",
  primary: "gradient-primary text-primary-foreground glow-primary",
  success: "glass-card border-l-4 border-l-[hsl(var(--success))]",
  warning: "glass-card border-l-4 border-l-[hsl(var(--warning))]",
};

export function KPICard({ title, value, icon: Icon, trend, variant = "default", description, className, compact = false }: KPICardProps) {
  if (compact) {
    return (
      <div className={cn(
        "rounded-lg p-3 transition-all duration-300 hover:scale-[1.02]",
        variantStyles[variant],
        className
      )}>
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-1.5 rounded-md shrink-0",
            variant === "primary" ? "bg-white/20" : "bg-secondary"
          )}>
            <Icon className={cn(
              "w-3.5 h-3.5",
              variant === "primary" ? "text-primary-foreground" : "text-primary"
            )} />
          </div>
          <div className="min-w-0">
            <p className={cn(
              "text-[10px] font-medium uppercase tracking-wide truncate",
              variant === "primary" ? "text-primary-foreground/80" : "text-muted-foreground"
            )}>
              {title}
            </p>
            <p className={cn(
              "text-lg font-bold tracking-tight leading-tight",
              variant === "primary" ? "text-primary-foreground" : "text-foreground"
            )}>
              {value}
            </p>
          </div>
        </div>
      </div>
    );
  }

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
