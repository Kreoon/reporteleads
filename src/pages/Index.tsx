import { useState, useMemo } from "react";
import { Header } from "@/components/dashboard/Header";
import { StickyFilters } from "@/components/dashboard/StickyFilters";
import { PautaKPIs } from "@/components/dashboard/PautaKPIs";
import { LeadsChart } from "@/components/dashboard/LeadsChart";
import { LeadsPautaVsCommercialsChart } from "@/components/dashboard/LeadsPautaVsCommercialsChart";
import { MetricsTable } from "@/components/dashboard/MetricsTable";
import { CommercialsTable } from "@/components/dashboard/CommercialsTable";
import { CommercialsChart } from "@/components/dashboard/CommercialsChart";
import { CommercialsKPIs } from "@/components/dashboard/CommercialsKPIs";
import { useMetrics } from "@/hooks/useMetrics";
import { parseDate } from "@/hooks/useDateFilters";
import { Skeleton } from "@/components/ui/skeleton";

const COUNTRIES = [
  { code: "EC", name: "Ecuador" },
  { code: "GT", name: "Guatemala" },
  { code: "COL", name: "Colombia" },
  { code: "RD", name: "Rep. Dominicana" },
  { code: "CR", name: "Costa Rica" },
];

const Index = () => {
  const { data, isLoading, lastUpdated, refetch } = useMetrics();
  const [selectedCountry, setSelectedCountry] = useState("EC");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  const hasActiveFilters = !!(dateRange.from || dateRange.to);

  const clearFilters = () => {
    setDateRange({ from: undefined, to: undefined });
  };

  const filterDate = (date: Date | null): boolean => {
    if (!date) return false;
    if (!dateRange.from && !dateRange.to) return true;

    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dateDay = startOfDay(date);

    if (dateRange.from && dateDay < startOfDay(dateRange.from)) return false;
    if (dateRange.to && dateDay > startOfDay(dateRange.to)) return false;

    return true;
  };

  // Get countries with data
  const countriesWithData = useMemo(() => {
    const pautaCountries = new Set(data?.rows?.map(r => r.pais) || []);
    const commercialCountries = new Set(data?.commercials?.map(r => r.pais) || []);
    const allCountries = new Set([...pautaCountries, ...commercialCountries]);
    return COUNTRIES.filter(c => allCountries.has(c.code));
  }, [data?.rows, data?.commercials]);

  // Filter pauta rows by country and date
  const filteredRows = useMemo(() => {
    const countryRows = data?.rows?.filter(row => row.pais === selectedCountry) || [];
    
    if (!hasActiveFilters) return countryRows;
    
    return countryRows.filter(row => {
      const date = parseDate(row.fecha);
      return filterDate(date);
    });
  }, [data?.rows, selectedCountry, hasActiveFilters, dateRange]);

  // Filter and group commercials
  const filteredCommercials = useMemo(() => {
    const countryCommercials = data?.commercials?.filter(row => row.pais === selectedCountry) || [];
    
    const filtered = hasActiveFilters
      ? countryCommercials.filter(row => {
          const date = parseDate(row.fecha);
          return filterDate(date);
        })
      : countryCommercials;
    
    const grouped = filtered.reduce((acc, row) => {
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
    }, {} as Record<string, typeof filtered[0]>);
    
    return Object.values(grouped);
  }, [data?.commercials, selectedCountry, hasActiveFilters, dateRange]);

  const renderPautaContent = () => (
    <>
      <div className="mb-4">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl bg-secondary" />
            ))}
          </div>
        ) : (
          <PautaKPIs data={filteredRows} commercialsData={filteredCommercials} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <>
            <Skeleton className="h-[280px] rounded-xl bg-secondary" />
            <Skeleton className="h-[280px] rounded-xl bg-secondary" />
            <Skeleton className="h-[280px] rounded-xl bg-secondary" />
          </>
        ) : (
          <>
            <LeadsChart data={filteredRows} />
            <LeadsPautaVsCommercialsChart pautaData={filteredRows} commercialsData={filteredCommercials} />
            <MetricsTable data={filteredRows} />
          </>
        )}
      </div>
    </>
  );

  const renderCommercialsContent = () => (
    <>
      <div className="mb-4">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl bg-secondary" />
            ))}
          </div>
        ) : (
          <CommercialsKPIs data={filteredCommercials} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoading ? (
          <>
            <Skeleton className="h-[280px] rounded-xl bg-secondary" />
            <Skeleton className="h-[280px] rounded-xl bg-secondary" />
          </>
        ) : (
          <>
            <CommercialsChart data={filteredCommercials} />
            <CommercialsTable data={filteredCommercials} />
          </>
        )}
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header 
        lastUpdated={lastUpdated} 
        isLoading={isLoading} 
        onRefresh={refetch} 
      />
      
      <StickyFilters
        countries={COUNTRIES}
        selectedCountry={selectedCountry}
        onCountryChange={setSelectedCountry}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />
      
      <main className="container mx-auto px-3 py-4 max-w-[1600px]">
        <section className="mb-6">
          <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            📈 Métricas de Pauta
          </h2>
          {renderPautaContent()}
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            📊 Performance de Comerciales
          </h2>
          {renderCommercialsContent()}
        </section>

        <footer className="text-center py-8 border-t border-border mt-8">
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-medium text-foreground">
              Grupo Effi
            </p>
          <p className="text-xs text-muted-foreground">
            © 2025 · Dashboard Captación de Leads · Datos actualizados cada 4 horas
          </p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
