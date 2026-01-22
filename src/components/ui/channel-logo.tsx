import { cn } from "@/lib/utils";

// Import channel logos
import logoMeta from "@/assets/channels/meta.png";
import logoGoogle from "@/assets/channels/google-ads.webp";
import logoTikTok from "@/assets/channels/tiktok.webp";
import logoYouTube from "@/assets/channels/youtube.png";
import logoDisplay from "@/assets/channels/display.png";

// Channel logos configuration
const CHANNEL_CONFIG: Record<string, string> = {
  "Meta Ads": logoMeta,
  "Google Ads": logoGoogle,
  "TikTok Ads": logoTikTok,
  "YouTube Ads": logoYouTube,
  "Display": logoDisplay,
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
  const logo = CHANNEL_CONFIG[channel];
  
  const imageSizeClasses = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  if (!logo) {
    return (
      <span className={cn("inline-flex items-center gap-1.5 text-muted-foreground text-xs", className)}>
        {channel}
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <img 
        src={logo} 
        alt={channel}
        className={cn(imageSizeClasses[size], "object-contain")}
      />
      {showName && <span className="text-xs font-medium text-foreground">{channel}</span>}
    </span>
  );
}

export { CHANNEL_CONFIG };
