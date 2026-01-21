import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, X, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Country {
  code: string;
  name: string;
}

interface StickyFiltersProps {
  countries: Country[];
  selectedCountry: string;
  onCountryChange: (country: string) => void;
  dateRange: { from: Date | undefined; to: Date | undefined };
  selectedMonth: string;
  selectedYear: string;
  onDateRangeChange: (range: { from: Date | undefined; to: Date | undefined }) => void;
  onMonthChange: (month: string) => void;
  onYearChange: (year: string) => void;
  onClearFilters: () => void;
}

const MONTHS = [
  { value: "all", label: "Todos" },
  { value: "01", label: "Ene" },
  { value: "02", label: "Feb" },
  { value: "03", label: "Mar" },
  { value: "04", label: "Abr" },
  { value: "05", label: "May" },
  { value: "06", label: "Jun" },
  { value: "07", label: "Jul" },
  { value: "08", label: "Ago" },
  { value: "09", label: "Sep" },
  { value: "10", label: "Oct" },
  { value: "11", label: "Nov" },
  { value: "12", label: "Dic" },
];

const currentYear = new Date().getFullYear();
const YEARS = [
  { value: "all", label: "Año" },
  ...Array.from({ length: currentYear - 2020 + 2 }, (_, i) => ({
    value: String(2020 + i),
    label: String(2020 + i),
  })),
];

export function StickyFilters({
  countries,
  selectedCountry,
  onCountryChange,
  dateRange,
  selectedMonth,
  selectedYear,
  onDateRangeChange,
  onMonthChange,
  onYearChange,
  onClearFilters,
}: StickyFiltersProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const hasActiveFilters =
    dateRange.from || dateRange.to || selectedMonth !== "all" || selectedYear !== "all";

  return (
    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-3">
        {/* Country Tabs */}
        <Tabs value={selectedCountry} onValueChange={onCountryChange} className="mb-3">
          <TabsList className="grid w-full grid-cols-5 bg-secondary/50">
            {countries.map((country) => (
              <TabsTrigger
                key={country.code}
                value={country.code}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
              >
                <span className="hidden sm:inline">{country.name}</span>
                <span className="sm:hidden">{country.code}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Date Filters Row */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />

          {/* Date Range Picker */}
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "justify-start text-left font-normal h-8 text-xs sm:text-sm",
                  !dateRange.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "dd/MM", { locale: es })} -{" "}
                      {format(dateRange.to, "dd/MM/yy", { locale: es })}
                    </>
                  ) : (
                    format(dateRange.from, "dd/MM/yy", { locale: es })
                  )
                ) : (
                  <span className="hidden sm:inline">Rango de fechas</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => {
                  onDateRangeChange({ from: range?.from, to: range?.to });
                  if (range?.from && range?.to) {
                    setIsCalendarOpen(false);
                  }
                }}
                numberOfMonths={2}
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          {/* Year Selector */}
          <Select value={selectedYear} onValueChange={onYearChange}>
            <SelectTrigger className="w-[80px] h-8 text-xs sm:text-sm">
              <SelectValue placeholder="Año" />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((year) => (
                <SelectItem key={year.value} value={year.value}>
                  {year.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Month Selector */}
          <Select value={selectedMonth} onValueChange={onMonthChange}>
            <SelectTrigger className="w-[90px] h-8 text-xs sm:text-sm">
              <SelectValue placeholder="Mes" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-8 px-2 text-muted-foreground hover:text-destructive"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              <span className="hidden sm:inline text-xs">Limpiar</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
