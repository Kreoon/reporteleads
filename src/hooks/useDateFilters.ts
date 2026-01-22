import { useState, useCallback, useMemo } from "react";

export interface DateFiltersState {
  dateRange: { from: Date | undefined; to: Date | undefined };
  selectedMonth: string;
  selectedYear: string;
}

interface UseDateFiltersReturn extends DateFiltersState {
  setDateRange: (range: { from: Date | undefined; to: Date | undefined }) => void;
  setSelectedMonth: (month: string) => void;
  setSelectedYear: (year: string) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  filterDate: (date: Date | null) => boolean;
}

/**
 * Parse any date string to Date object
 * Supports: 
 * - "YYYY-MM-DD HH:mm:ss.sss" (webhook format with space)
 * - ISO 8601 "YYYY-MM-DDTHH:mm:ss.sssZ"
 * - "DD/MM/YYYY" or "DD/MM/YY"
 */
export const parseDate = (input: string | undefined | null): Date | null => {
  if (!input) return null;
  
  const str = input.trim();
  if (!str) return null;

  try {
    // Format: "YYYY-MM-DD" (new webhook format, e.g., "2026-01-12")
    // This is the PRIMARY format from the webhook
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      const [yearStr, monthStr, dayStr] = str.split('-');
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10) - 1; // JS months are 0-indexed
      const day = parseInt(dayStr, 10);
      
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        const d = new Date(year, month, day);
        // Validate the date is valid
        if (d.getFullYear() === year && d.getMonth() === month && d.getDate() === day) {
          return d;
        }
      }
    }

    // Format: "YYYY-MM-DD HH:mm:ss.sss" (webhook format with space and time)
    if (/^\d{4}-\d{2}-\d{2}\s/.test(str)) {
      const datePart = str.split(' ')[0];
      const [yearStr, monthStr, dayStr] = datePart.split('-');
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10) - 1;
      const day = parseInt(dayStr, 10);
      
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        const d = new Date(year, month, day);
        if (d.getFullYear() === year && d.getMonth() === month && d.getDate() === day) {
          return d;
        }
      }
    }

    // ISO 8601 format (e.g., "2025-05-13T05:00:00.000Z")
    if (str.includes('T') && str.includes('-')) {
      const d = new Date(str);
      if (!isNaN(d.getTime())) return d;
    }

    // DD/MM/YYYY or DD/MM/YY format
    const parts = str.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      let year = parseInt(parts[2], 10);
      
      // Handle 2-digit years (26 -> 2026)
      if (year < 100) year += 2000;

      if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
      
      const d = new Date(year, month, day);
      
      // Validate to avoid JS date rollover
      if (d.getFullYear() === year && d.getMonth() === month && d.getDate() === day) {
        return d;
      }
    }

    return null;
  } catch {
    return null;
  }
};

export function useDateFilters(): UseDateFiltersReturn {
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");

  const hasActiveFilters = useMemo(() => {
    return !!(dateRange.from || dateRange.to || selectedMonth !== "all" || selectedYear !== "all");
  }, [dateRange, selectedMonth, selectedYear]);

  const clearFilters = useCallback(() => {
    setDateRange({ from: undefined, to: undefined });
    setSelectedMonth("all");
    setSelectedYear("all");
  }, []);

  /**
   * Check if a date passes all active filters
   * Returns true if no filters are active OR if date matches all active filters
   */
  const filterDate = useCallback((date: Date | null): boolean => {
    // If no date provided and filters are active, exclude
    // If no date provided and NO filters active, this shouldn't even be called
    // (the hasActiveFilters check in Index.tsx handles that)
    if (!date) return false;

    // Date range filter
    if (dateRange.from || dateRange.to) {
      const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dateDay = startOfDay(date);
      
      if (dateRange.from && dateDay < startOfDay(dateRange.from)) return false;
      if (dateRange.to && dateDay > startOfDay(dateRange.to)) return false;
    }

    // Year filter
    if (selectedYear !== "all") {
      if (String(date.getFullYear()) !== selectedYear) return false;
    }

    // Month filter (1-indexed in selector, 0-indexed in Date)
    if (selectedMonth !== "all") {
      const monthNum = date.getMonth() + 1;
      const monthStr = String(monthNum).padStart(2, '0');
      if (monthStr !== selectedMonth) return false;
    }

    return true;
  }, [dateRange, selectedMonth, selectedYear]);

  return {
    dateRange,
    selectedMonth,
    selectedYear,
    setDateRange,
    setSelectedMonth,
    setSelectedYear,
    clearFilters,
    hasActiveFilters,
    filterDate,
  };
}
