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
import { useDateFilters, parseDate } from "@/hooks/useDateFilters";
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
  
  const {
    dateRange,
    selectedMonth,
    selectedYear,
    setDateRange,
    setSelectedMonth,
    setSelectedYear,
    clearFilters,
    hasActiveFilters,
    filterDate,
  } = useDateFilters();

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
    
    // If no date filters active, return all country rows
    if (!hasActiveFilters) return countryRows;
    
    return countryRows.filter(row => {
      const date = parseDate(row.fecha);
      const passes = filterDate(date);
      // Debug logging
      console.log(`[Filter] fecha: "${row.fecha}" -> parsed: ${date?.toISOString()} -> passes: ${passes}, month: ${selectedMonth}, year: ${selectedYear}`);
      return passes;
    });
  }, [data?.rows, selectedCountry, hasActiveFilters, filterDate, selectedMonth, selectedYear]);

  // Filter and group commercials
  const filteredCommercials = useMemo(() => {
    const countryCommercials = data?.commercials?.filter(row => row.pais === selectedCountry) || [];
    
    // Apply date filters
    const filtered = hasActiveFilters
      ? countryCommercials.filter(row => {
          const date = parseDate(row.fecha);
          return filterDate(date);
        })
      : countryCommercials;
    
    // Group by commercial name and aggregate
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
  }, [data?.commercials, selectedCountry, hasActiveFilters, filterDate]);

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

      {/* Charts + Table in 3-column layout */}
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

      {/* Chart + Table side by side */}
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
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onDateRangeChange={setDateRange}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />
      
      <main className="container mx-auto px-3 py-4 max-w-[1600px]">
        {/* Section: Pauta (Marketing Metrics) */}
        <section className="mb-6">
          <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            📈 Métricas de Pauta
          </h2>
          {renderPautaContent()}
        </section>

        {/* Section: Commercials */}
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
              © 2025 · Dashboard Captación de Leads · Datos actualizados cada 5 minutos
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
