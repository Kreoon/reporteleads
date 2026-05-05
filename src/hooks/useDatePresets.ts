import {
  startOfDay, endOfDay, subDays,
  startOfWeek, endOfWeek,
  startOfMonth, endOfMonth, subMonths,
  startOfQuarter, endOfQuarter, subQuarters,
  startOfYear, endOfYear, subYears,
} from "date-fns";

export type DatePreset =
  | "today" | "yesterday"
  | "thisWeek" | "lastWeek"
  | "last7days" | "last14days" | "last28days" | "last30days"
  | "thisMonth" | "lastMonth"
  | "last90days" | "thisQuarter" | "lastQuarter"
  | "thisYear" | "lastYear"
  | "maximum"
  | "custom";

export interface DatePresetOption {
  value: DatePreset;
  label: string;
  dividerBefore?: boolean; // Separador visual entre grupos
}

export const DATE_PRESETS: DatePresetOption[] = [
  { value: "today",       label: "Hoy" },
  { value: "yesterday",   label: "Ayer" },
  { value: "thisWeek",    label: "Esta semana",       dividerBefore: true },
  { value: "lastWeek",    label: "La semana pasada" },
  { value: "last7days",   label: "Últimos 7 días",    dividerBefore: true },
  { value: "last14days",  label: "Últimos 14 días" },
  { value: "last28days",  label: "Últimos 28 días" },
  { value: "last30days",  label: "Últimos 30 días" },
  { value: "thisMonth",   label: "Este mes",          dividerBefore: true },
  { value: "lastMonth",   label: "Último mes" },
  { value: "last90days",  label: "Últimos 90 días",   dividerBefore: true },
  { value: "thisQuarter", label: "Este trimestre" },
  { value: "lastQuarter", label: "Trimestre pasado" },
  { value: "thisYear",    label: "Este año",          dividerBefore: true },
  { value: "lastYear",    label: "Último año" },
  { value: "maximum",     label: "Máximo",            dividerBefore: true },
  { value: "custom",      label: "Personalizado",     dividerBefore: true },
];

export function getDateRangeFromPreset(preset: DatePreset): { from: Date; to: Date } | null {
  const now = new Date();
  const today = startOfDay(now);
  const todayEnd = endOfDay(now);

  switch (preset) {
    case "today":
      return { from: today, to: todayEnd };

    case "yesterday": {
      const y = subDays(today, 1);
      return { from: y, to: endOfDay(y) };
    }

    case "thisWeek":
      return { from: startOfWeek(now, { weekStartsOn: 1 }), to: todayEnd };

    case "lastWeek": {
      const lastWeekStart = startOfWeek(subDays(today, 7), { weekStartsOn: 1 });
      return { from: lastWeekStart, to: endOfWeek(lastWeekStart, { weekStartsOn: 1 }) };
    }

    case "last7days":
      return { from: subDays(today, 6), to: todayEnd };

    case "last14days":
      return { from: subDays(today, 13), to: todayEnd };

    case "last28days":
      return { from: subDays(today, 27), to: todayEnd };

    case "last30days":
      return { from: subDays(today, 29), to: todayEnd };

    case "thisMonth":
      return { from: startOfMonth(now), to: todayEnd };

    case "lastMonth": {
      const lm = subMonths(now, 1);
      return { from: startOfMonth(lm), to: endOfMonth(lm) };
    }

    case "last90days":
      return { from: subDays(today, 89), to: todayEnd };

    case "thisQuarter":
      return { from: startOfQuarter(now), to: todayEnd };

    case "lastQuarter": {
      const lq = subQuarters(now, 1);
      return { from: startOfQuarter(lq), to: endOfQuarter(lq) };
    }

    case "thisYear":
      return { from: startOfYear(now), to: todayEnd };

    case "lastYear": {
      const ly = subYears(now, 1);
      return { from: startOfYear(ly), to: endOfYear(ly) };
    }

    case "maximum":
      return { from: new Date(2020, 0, 1), to: todayEnd };

    case "custom":
      return null;

    default:
      return null;
  }
}
