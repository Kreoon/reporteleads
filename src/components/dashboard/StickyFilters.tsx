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
  hasActiveFilters: boolean;
}

const MONTHS = [
  { value: "all", label: "Todos" },
  { value: "01", label: "Enero" },
  { value: "02", label: "Febrero" },
  { value: "03", label: "Marzo" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Mayo" },
  { value: "06", label: "Junio" },
  { value: "07", label: "Julio" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

const currentYear = new Date().getFullYear();
const YEARS = [
  { value: "all", label: "Todos" },
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
  hasActiveFilters,
}: StickyFiltersProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const formatDateRange = () => {
    if (!dateRange.from) return null;
    
    if (dateRange.to) {
      return `${format(dateRange.from, "dd MMM", { locale: es })} - ${format(dateRange.to, "dd MMM yyyy", { locale: es })}`;
    }
    return format(dateRange.from, "dd MMM yyyy", { locale: es });
  };

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
                  "justify-start text-left font-normal h-9 min-w-[180px]",
                  !dateRange.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formatDateRange() || "Rango de fechas"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from || new Date()}
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
            <SelectTrigger className="w-[100px] h-9">
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
            <SelectTrigger className="w-[130px] h-9">
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
              className="h-9 px-3 text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4 mr-1" />
              Limpiar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
