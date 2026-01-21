import { useState, useMemo } from "react";
import { Header } from "@/components/dashboard/Header";
import { StickyFilters } from "@/components/dashboard/StickyFilters";
import { PautaKPIs } from "@/components/dashboard/PautaKPIs";
import { LeadsChart } from "@/components/dashboard/LeadsChart";
import { InvestmentChart } from "@/components/dashboard/InvestmentChart";
import { MetricsTable } from "@/components/dashboard/MetricsTable";
import { CommercialsTable } from "@/components/dashboard/CommercialsTable";
import { CommercialsChart } from "@/components/dashboard/CommercialsChart";
import { CommercialsKPIs } from "@/components/dashboard/CommercialsKPIs";
import { useMetrics } from "@/hooks/useMetrics";
import { Skeleton } from "@/components/ui/skeleton";

const COUNTRIES = [
  { code: "EC", name: "Ecuador" },
  { code: "GT", name: "Guatemala" },
  { code: "COL", name: "Colombia" },
  { code: "RD", name: "Rep. Dominicana" },
  { code: "CR", name: "Costa Rica" },
];

// Parse fecha string "DD Mes" or extract from API format to comparable date
const parseFechaToDate = (fechaStr: string): Date | null => {
  try {
    const months: Record<string, number> = {
      'Ene': 0, 'Feb': 1, 'Mar': 2, 'Abr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Ago': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dic': 11
    };
    
    // Check if it's in "DD Mes" format (already formatted)
    const parts = fechaStr.split(' ');
    if (parts.length === 2 && months[parts[1]] !== undefined) {
      const day = parseInt(parts[0], 10);
      const month = months[parts[1]];
      const year = new Date().getFullYear();
      return new Date(year, month, day);
    }
    
    // Check if it's in "D/MM/YYYY" or "DD/MM/YYYY" format (raw from API)
    const slashParts = fechaStr.split('/');
    if (slashParts.length === 3) {
      const day = parseInt(slashParts[0], 10);
      const month = parseInt(slashParts[1], 10) - 1;
      const rawYear = parseInt(slashParts[2], 10);
      // Support 2-digit years like "21/01/26" coming from some webhooks
      const year = rawYear < 100 ? 2000 + rawYear : rawYear;
      return new Date(year, month, day);
    }
    
    return null;
  } catch {
    return null;
  }
};

type CommercialDateMode = "business" | "record";

// Commercials have two date notions:
// - business: the Fecha coming from the dataset (preferred for day-by-day analysis)
// - record: createdAt from the webhook DB (useful when filtering by month/year of ingestion)
const getCommercialDate = (
  row: { fecha?: string; createdAt?: string },
  mode: CommercialDateMode = "business",
): Date | null => {
  const business = row.fecha ? parseFechaToDate(row.fecha) : null;
  const record = row.createdAt ? new Date(row.createdAt) : null;
  const recordValid = record && !isNaN(record.getTime()) ? record : null;

  if (mode === "record") return recordValid ?? business;
  return business ?? recordValid;
};

const Index = () => {
  const { data, isLoading, lastUpdated, refetch } = useMetrics();
  const [selectedCountry, setSelectedCountry] = useState("EC");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");

  // Filter data by country and date filters
  const filteredRows = useMemo(() => {
    let rows = data?.rows?.filter(row => row.pais === selectedCountry) || [];
    
    // Filter by date range
    if (dateRange.from || dateRange.to) {
      rows = rows.filter(row => {
        const rowDate = parseFechaToDate(row.fecha);
        if (!rowDate) return true;
        
        if (dateRange.from && dateRange.to) {
          return rowDate >= dateRange.from && rowDate <= dateRange.to;
        } else if (dateRange.from) {
          return rowDate >= dateRange.from;
        } else if (dateRange.to) {
          return rowDate <= dateRange.to;
        }
        return true;
      });
    }
    
    // Filter by year
    if (selectedYear !== "all") {
      rows = rows.filter(row => {
        const rowDate = parseFechaToDate(row.fecha);
        if (!rowDate) return true;
        return String(rowDate.getFullYear()) === selectedYear;
      });
    }
    
    // Filter by month
    if (selectedMonth !== "all") {
      rows = rows.filter(row => {
        const rowDate = parseFechaToDate(row.fecha);
        if (!rowDate) return true;
        const monthStr = String(rowDate.getMonth() + 1).padStart(2, '0');
        return monthStr === selectedMonth;
      });
    }
    
    return rows;
  }, [data?.rows, selectedCountry, dateRange, selectedMonth, selectedYear]);

  // Filter commercials by country and date filters, then group by commercial name
  const filteredCommercials = useMemo(() => {
    let commercials = data?.commercials?.filter(row => row.pais === selectedCountry) || [];
    
    // Filter by date range (if commercials have fecha field)
    if (dateRange.from || dateRange.to) {
      commercials = commercials.filter(row => {
        const rowDate = getCommercialDate(row, "business");
        if (!rowDate) return false;
        
        if (dateRange.from && dateRange.to) {
          return rowDate >= dateRange.from && rowDate <= dateRange.to;
        } else if (dateRange.from) {
          return rowDate >= dateRange.from;
        } else if (dateRange.to) {
          return rowDate <= dateRange.to;
        }
        return true;
      });
    }
    
    // Filter by year (if commercials have fecha field)
    if (selectedYear !== "all") {
      commercials = commercials.filter(row => {
        const rowDate = getCommercialDate(row, "record");
        if (!rowDate) return false;
        return String(rowDate.getFullYear()) === selectedYear;
      });
    }
    
    // Filter by month (if commercials have fecha field)
    if (selectedMonth !== "all") {
      commercials = commercials.filter(row => {
        const rowDate = getCommercialDate(row, "record");
        if (!rowDate) return false;
        const monthStr = String(rowDate.getMonth() + 1).padStart(2, '0');
        return monthStr === selectedMonth;
      });
    }
    
    // Group by commercial name and aggregate metrics
    const grouped = commercials.reduce((acc, row) => {
      const key = row.comercial;
      if (!acc[key]) {
        acc[key] = {
          comercial: row.comercial,
          pais: row.pais,
          contactos: 0,
          cuentasCerradas: 0,
          cuentasGestion: 0,
          cuentasPendiente: 0,
          cuentasDescartadas: 0,
          montoTotal: 0,
        };
      }
      acc[key].contactos += row.contactos;
      acc[key].cuentasCerradas += row.cuentasCerradas;
      acc[key].cuentasGestion += row.cuentasGestion;
      acc[key].cuentasPendiente += row.cuentasPendiente;
      acc[key].cuentasDescartadas += row.cuentasDescartadas;
      acc[key].montoTotal += row.montoTotal;
      return acc;
    }, {} as Record<string, typeof commercials[0]>);
    
    return Object.values(grouped);
  }, [data?.commercials, selectedCountry, dateRange, selectedMonth, selectedYear]);

  const handleClearFilters = () => {
    setDateRange({ from: undefined, to: undefined });
    setSelectedMonth("all");
    setSelectedYear("all");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        lastUpdated={lastUpdated} 
        isLoading={isLoading} 
        onRefresh={refetch} 
      />
      
      {/* Sticky Filters */}
      <StickyFilters
        countries={COUNTRIES}
        selectedCountry={selectedCountry}
        onCountryChange={setSelectedCountry}
        dateRange={dateRange}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onDateRangeChange={setDateRange}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
        onClearFilters={handleClearFilters}
      />
      
      <main className="container mx-auto px-4 py-6">
        {/* Section: Pauta (Marketing Metrics) */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            📈 Métricas de Pauta
          </h2>

          {/* KPI Cards - Pauta */}
          <div className="mb-6">
            {isLoading ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-28 rounded-xl bg-secondary" />
                  ))}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-28 rounded-xl bg-secondary" />
                  ))}
                </div>
              </div>
            ) : (
              <PautaKPIs data={filteredRows} />
            )}
          </div>

          {/* Charts - Pauta */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {isLoading ? (
              <>
                <Skeleton className="h-[350px] rounded-xl bg-secondary" />
                <Skeleton className="h-[350px] rounded-xl bg-secondary" />
              </>
            ) : (
              <>
                <LeadsChart data={filteredRows} />
                <InvestmentChart data={filteredRows} />
              </>
            )}
          </div>

          {/* Table - Pauta */}
          {isLoading ? (
            <Skeleton className="h-[350px] rounded-xl bg-secondary" />
          ) : (
            <MetricsTable data={filteredRows} />
          )}
        </section>

        {/* Section: Commercials */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            📊 Performance de Comerciales
          </h2>

          {/* Commercials KPIs */}
          <div className="mb-6">
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-28 rounded-xl bg-secondary" />
                ))}
              </div>
            ) : (
              <CommercialsKPIs data={filteredCommercials} />
            )}
          </div>

          {/* Commercials Chart */}
          <div className="mb-6">
            {isLoading ? (
              <Skeleton className="h-[350px] rounded-xl bg-secondary" />
            ) : (
              <CommercialsChart data={filteredCommercials} />
            )}
          </div>

          {/* Commercials Table */}
          {isLoading ? (
            <Skeleton className="h-[350px] rounded-xl bg-secondary" />
          ) : (
            <CommercialsTable data={filteredCommercials} />
          )}
        </section>

        {/* Footer */}
        <footer className="text-center py-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            © 2025 EFFI Commerce · Los datos se actualizan automáticamente cada 5 minutos
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
