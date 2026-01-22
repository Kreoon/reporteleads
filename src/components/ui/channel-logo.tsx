import { cn } from "@/lib/utils";

// Channel logos using brand colors and icons
const CHANNEL_CONFIG: Record<string, { icon: string; color: string; bgColor: string }> = {
  "Meta Ads": {
    icon: "📘",
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  "Google Ads": {
    icon: "🔍",
    color: "text-red-500",
    bgColor: "bg-red-100 dark:bg-red-900/30",
  },
  "TikTok Ads": {
    icon: "🎵",
    color: "text-pink-500",
    bgColor: "bg-pink-100 dark:bg-pink-900/30",
  },
  "YouTube Ads": {
    icon: "▶️",
    color: "text-red-600",
    bgColor: "bg-red-100 dark:bg-red-900/30",
  },
  "Display": {
    icon: "🖥️",
    color: "text-purple-500",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
  },
  "LinkedIn Ads": {
    icon: "💼",
    color: "text-blue-700",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
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
  const config = CHANNEL_CONFIG[channel] || {
    icon: "📊",
    color: "text-muted-foreground",
    bgColor: "bg-secondary",
  };
  
  const sizeClasses = {
    sm: "text-sm px-1.5 py-0.5",
    md: "text-base px-2 py-1",
    lg: "text-lg px-2.5 py-1.5",
  };

  const iconSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <span 
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        config.bgColor,
        config.color,
        sizeClasses[size],
        className
      )}
    >
      <span className={iconSizeClasses[size]} role="img" aria-label={channel}>
        {config.icon}
      </span>
      {showName && <span className="text-xs">{channel}</span>}
    </span>
  );
}

export { CHANNEL_CONFIG };
