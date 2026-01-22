import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DATE_PRESETS,
  DatePreset,
  getDateRangeFromPreset,
} from "@/hooks/useDatePresets";

interface DatePresetSelectorProps {
  dateRange: { from: Date | undefined; to: Date | undefined };
  onDateRangeChange: (range: { from: Date | undefined; to: Date | undefined }) => void;
  className?: string;
}

export function DatePresetSelector({
  dateRange,
  onDateRangeChange,
  className,
}: DatePresetSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomCalendar, setShowCustomCalendar] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<DatePreset | null>(null);

  const handlePresetSelect = (preset: DatePreset) => {
    setSelectedPreset(preset);
    
    if (preset === "custom") {
      setShowCustomCalendar(true);
      return;
    }

    const range = getDateRangeFromPreset(preset);
    if (range) {
      onDateRangeChange({ from: range.from, to: range.to });
      setShowCustomCalendar(false);
      setIsOpen(false);
    }
  };

  const handleCustomRangeSelect = (range: { from?: Date; to?: Date } | undefined) => {
    onDateRangeChange({ from: range?.from, to: range?.to });
    if (range?.from && range?.to) {
      setIsOpen(false);
    }
  };

  const formatDateRange = () => {
    if (!dateRange.from) {
      return "Seleccionar período";
    }
    
    if (selectedPreset && selectedPreset !== "custom") {
      const presetLabel = DATE_PRESETS.find(p => p.value === selectedPreset)?.label;
      if (presetLabel) return presetLabel;
    }

    if (dateRange.to) {
      return `${format(dateRange.from, "dd MMM", { locale: es })} - ${format(dateRange.to, "dd MMM yyyy", { locale: es })}`;
    }
    return format(dateRange.from, "dd MMM yyyy", { locale: es });
  };

  const clearSelection = () => {
    setSelectedPreset(null);
    setShowCustomCalendar(false);
    onDateRangeChange({ from: undefined, to: undefined });
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "justify-between text-left font-normal h-9 min-w-[180px]",
            !dateRange.from && "text-muted-foreground",
            className
          )}
        >
          <div className="flex items-center">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange()}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          {/* Preset List */}
          <div className="border-r border-border p-2 min-w-[160px]">
            <div className="space-y-1">
              {DATE_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handlePresetSelect(preset.value)}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    selectedPreset === preset.value && "bg-primary text-primary-foreground"
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            {dateRange.from && (
              <div className="mt-2 pt-2 border-t border-border">
                <button
                  onClick={clearSelection}
                  className="w-full text-left px-3 py-2 text-sm rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  Limpiar
                </button>
              </div>
            )}
          </div>

          {/* Custom Calendar (shows when "Personalizado" is selected) */}
          {showCustomCalendar && (
            <div className="p-3">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from || new Date()}
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={handleCustomRangeSelect}
                numberOfMonths={2}
                className="pointer-events-auto"
              />
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
