import { cn } from "@/lib/utils";

const FLAGS: Record<string, string> = {
  EC: "🇪🇨",
  GT: "🇬🇹",
  COL: "🇨🇴",
  RD: "🇩🇴",
  CR: "🇨🇷",
};

interface CountryFlagProps {
  code: string;
  showCode?: boolean;
  showName?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const COUNTRY_NAMES: Record<string, string> = {
  EC: "Ecuador",
  GT: "Guatemala",
  COL: "Colombia",
  RD: "Rep. Dominicana",
  CR: "Costa Rica",
};

export function CountryFlag({ 
  code, 
  showCode = false, 
  showName = false,
  className,
  size = "md" 
}: CountryFlagProps) {
  const flag = FLAGS[code] || "🏳️";
  const name = COUNTRY_NAMES[code] || code;
  
  const sizeClasses = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className={sizeClasses[size]} role="img" aria-label={name}>
        {flag}
      </span>
      {showCode && <span className="text-xs font-medium">{code}</span>}
      {showName && <span className="text-sm">{name}</span>}
    </span>
  );
}

export { FLAGS, COUNTRY_NAMES };
