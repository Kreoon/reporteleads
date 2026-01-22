import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, subYears } from "date-fns";

export type DatePreset = 
  | "today"
  | "yesterday"
  | "last7days"
  | "last15days"
  | "lastMonth"
  | "thisMonth"
  | "last3months"
  | "thisYear"
  | "lastYear"
  | "custom";

export interface DatePresetOption {
  value: DatePreset;
  label: string;
}

export const DATE_PRESETS: DatePresetOption[] = [
  { value: "today", label: "Hoy" },
  { value: "yesterday", label: "Ayer" },
  { value: "last7days", label: "Últimos 7 días" },
  { value: "last15days", label: "Últimos 15 días" },
  { value: "lastMonth", label: "Último mes" },
  { value: "thisMonth", label: "Este mes" },
  { value: "last3months", label: "Últimos 3 meses" },
  { value: "thisYear", label: "Este año" },
  { value: "lastYear", label: "Último año" },
  { value: "custom", label: "Personalizado" },
];

export function getDateRangeFromPreset(preset: DatePreset): { from: Date; to: Date } | null {
  const now = new Date();
  const today = startOfDay(now);
  const todayEnd = endOfDay(now);

  switch (preset) {
    case "today":
      return { from: today, to: todayEnd };
    
    case "yesterday":
      const yesterday = subDays(today, 1);
      return { from: yesterday, to: endOfDay(yesterday) };
    
    case "last7days":
      return { from: subDays(today, 6), to: todayEnd };
    
    case "last15days":
      return { from: subDays(today, 14), to: todayEnd };
    
    case "lastMonth":
      const lastMonthStart = startOfMonth(subMonths(now, 1));
      const lastMonthEnd = endOfMonth(subMonths(now, 1));
      return { from: lastMonthStart, to: lastMonthEnd };
    
    case "thisMonth":
      return { from: startOfMonth(now), to: todayEnd };
    
    case "last3months":
      return { from: startOfMonth(subMonths(now, 2)), to: todayEnd };
    
    case "thisYear":
      return { from: startOfYear(now), to: todayEnd };
    
    case "lastYear":
      const lastYearStart = startOfYear(subYears(now, 1));
      const lastYearEnd = endOfYear(subYears(now, 1));
      return { from: lastYearStart, to: lastYearEnd };
    
    case "custom":
      return null;
    
    default:
      return null;
  }
}
