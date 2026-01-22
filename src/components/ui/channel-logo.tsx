import { cn } from "@/lib/utils";

// Import channel logos
import logoMeta from "@/assets/channels/meta.png";
import logoGoogle from "@/assets/channels/google-ads.webp";
import logoTikTok from "@/assets/channels/tiktok.webp";
import logoYouTube from "@/assets/channels/youtube.png";
import logoDisplay from "@/assets/channels/display.png";

// Channel logos configuration
const CHANNEL_CONFIG: Record<string, { logo: string; bgColor: string }> = {
  "Meta Ads": {
    logo: logoMeta,
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
  },
  "Google Ads": {
    logo: logoGoogle,
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
  },
  "TikTok Ads": {
    logo: logoTikTok,
    bgColor: "bg-gray-100 dark:bg-gray-800",
  },
  "YouTube Ads": {
    logo: logoYouTube,
    bgColor: "bg-red-50 dark:bg-red-900/20",
  },
  "Display": {
    logo: logoDisplay,
    bgColor: "bg-green-50 dark:bg-green-900/20",
  },
};

interface ChannelLogoProps {
  channel: string;
  showName?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function ChannelLogo({ 
  channel, 
  showName = false,
  className,
  size = "md" 
}: ChannelLogoProps) {
  const config = CHANNEL_CONFIG[channel];
  
  const containerSizeClasses = {
    sm: "p-1",
    md: "p-1.5",
    lg: "p-2",
  };

  const imageSizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  if (!config) {
    return (
      <span className={cn("inline-flex items-center gap-1.5 text-muted-foreground text-xs", className)}>
        {channel}
      </span>
    );
  }

  return (
    <span 
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg",
        config.bgColor,
        containerSizeClasses[size],
        className
      )}
    >
      <img 
        src={config.logo} 
        alt={channel}
        className={cn(imageSizeClasses[size], "object-contain")}
      />
      {showName && <span className="text-xs font-medium text-foreground">{channel}</span>}
    </span>
  );
}

export { CHANNEL_CONFIG };
