import { cn } from "@/lib/utils";

// Import flag images
import flagEC from "@/assets/flags/ec.png";
import flagGT from "@/assets/flags/gt.png";
import flagCOL from "@/assets/flags/col.png";
import flagRD from "@/assets/flags/rd.png";
import flagCR from "@/assets/flags/cr.svg";

const FLAGS: Record<string, string> = {
  EC: flagEC,
  GT: flagGT,
  COL: flagCOL,
  RD: flagRD,
  CR: flagCR,
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
  const flagSrc = FLAGS[code];
  const name = COUNTRY_NAMES[code] || code;
  
  const sizeClasses = {
    sm: "h-4 w-6",
    md: "h-5 w-7",
    lg: "h-6 w-9",
  };

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      {flagSrc ? (
        <img 
          src={flagSrc} 
          alt={name}
          className={cn(sizeClasses[size], "object-cover rounded-sm shadow-sm")}
        />
      ) : (
        <span className="text-muted-foreground text-xs">{code}</span>
      )}
      {showCode && <span className="text-xs font-medium">{code}</span>}
      {showName && <span className="text-sm">{name}</span>}
    </span>
  );
}

export { FLAGS, COUNTRY_NAMES };
