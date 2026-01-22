import { X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePresetSelector } from "@/components/ui/date-preset-selector";
import { CountryFlag } from "@/components/ui/country-flag";

interface Country {
  code: string;
  name: string;
}

interface StickyFiltersProps {
  countries: Country[];
  selectedCountry: string;
  onCountryChange: (country: string) => void;
  dateRange: { from: Date | undefined; to: Date | undefined };
  onDateRangeChange: (range: { from: Date | undefined; to: Date | undefined }) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function StickyFilters({
  countries,
  selectedCountry,
  onCountryChange,
  dateRange,
  onDateRangeChange,
  onClearFilters,
  hasActiveFilters,
}: StickyFiltersProps) {
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
                <CountryFlag code={country.code} size="sm" />
                <span className="hidden sm:inline ml-1.5">{country.name}</span>
                <span className="sm:hidden ml-1">{country.code}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Date Filters Row */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />

          {/* Date Preset Selector */}
          <DatePresetSelector
            dateRange={dateRange}
            onDateRangeChange={onDateRangeChange}
          />

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
