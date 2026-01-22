import { useState, useMemo } from "react";
import { StrategicHeader } from "@/components/strategic/StrategicHeader";
import { StrategicKPIs } from "@/components/strategic/StrategicKPIs";
import { PautaTable } from "@/components/strategic/PautaTable";
import { InvestmentLeadsChart } from "@/components/strategic/InvestmentLeadsChart";
import { CTRByCountryChart } from "@/components/strategic/CTRByCountryChart";
import { InvestmentByChannelChart } from "@/components/strategic/InvestmentByChannelChart";
import { CPAByCountryChart } from "@/components/strategic/CPAByCountryChart";
import { AnalyticsSummary } from "@/components/strategic/AnalyticsSummary";
import { StrategicFilters } from "@/components/strategic/StrategicFilters";
import { useMetrics } from "@/hooks/useMetrics";
import { parseDate } from "@/hooks/useDateFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export interface StrategicFiltersState {
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  countries: string[];
  channels: string[];
  campaignTypes: string[];
  sortBy: string;
  sortOrder: "asc" | "desc";
}

const StrategicDashboard = () => {
  const { data, isLoading, lastUpdated, refetch } = useMetrics();
  
  const [filters, setFilters] = useState<StrategicFiltersState>({
    dateFrom: undefined,
    dateTo: undefined,
    countries: [],
    channels: [],
    campaignTypes: [],
    sortBy: "fecha",
    sortOrder: "desc",
  });

  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    const rows = data?.rows || [];
    return {
      countries: [...new Set(rows.map(r => r.pais))].filter(Boolean),
      channels: [...new Set(rows.map(r => r.canal))].filter(Boolean) as string[],
      campaignTypes: [...new Set(rows.map(r => r.tipoCampana))].filter(Boolean) as string[],
    };
  }, [data?.rows]);

  // Filter and sort data
  const filteredRows = useMemo(() => {
    let rows = data?.rows || [];
    
    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      rows = rows.filter(row => {
        const rowDate = parseDate(row.fecha);
        if (!rowDate) return true;
        if (filters.dateFrom && rowDate < filters.dateFrom) return false;
        if (filters.dateTo && rowDate > filters.dateTo) return false;
        return true;
      });
    }
    
    // Country filter
    if (filters.countries.length > 0) {
      rows = rows.filter(row => filters.countries.includes(row.pais));
    }
    
    // Channel filter
    if (filters.channels.length > 0) {
      rows = rows.filter(row => row.canal && filters.channels.includes(row.canal));
    }
    
    // Campaign type filter
    if (filters.campaignTypes.length > 0) {
      rows = rows.filter(row => row.tipoCampana && filters.campaignTypes.includes(row.tipoCampana));
    }
    
    // Sorting
    rows = [...rows].sort((a, b) => {
      let aVal: number | string = 0;
      let bVal: number | string = 0;
      
      switch (filters.sortBy) {
        case "inversion":
          aVal = a.inversion;
          bVal = b.inversion;
          break;
        case "leads":
          aVal = a.leads;
          bVal = b.leads;
          break;
        case "ctr":
          aVal = a.ctr;
          bVal = b.ctr;
          break;
        case "cpa":
          aVal = a.cpa || 0;
          bVal = b.cpa || 0;
          break;
        case "fecha":
        default:
          aVal = a.fecha;
          bVal = b.fecha;
          break;
      }
      
      if (filters.sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });
    
    return rows;
  }, [data?.rows, filters]);

  // Check for CPA alerts (>20% increase)
  const cpaAlert = useMemo(() => {
    if (filteredRows.length < 2) return null;
    const sorted = [...filteredRows].sort((a, b) => a.fecha.localeCompare(b.fecha));
    const recent = sorted[sorted.length - 1];
    const previous = sorted[sorted.length - 2];
    
    if (recent.cpa && previous.cpa && previous.cpa > 0) {
      const increase = ((recent.cpa - previous.cpa) / previous.cpa) * 100;
      if (increase > 20) {
        return {
          increase: increase.toFixed(1),
          current: recent.cpa,
          previous: previous.cpa,
        };
      }
    }
    return null;
  }, [filteredRows]);

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex w-full">
        <StrategicFilters
          filters={filters}
          onFiltersChange={setFilters}
          options={filterOptions}
        />
        
        <div className="flex-1 flex flex-col min-w-0">
          <StrategicHeader
            lastUpdated={lastUpdated}
            isLoading={isLoading}
            onRefresh={refetch}
            cpaAlert={cpaAlert}
          />
          
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            <div className="max-w-[1800px] mx-auto space-y-6">
              {/* KPIs Section */}
              <section>
                <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                  📊 KPIs en Tiempo Real
                </h2>
                {isLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {[...Array(6)].map((_, i) => (
                      <Skeleton key={i} className="h-28 rounded-xl bg-secondary" />
                    ))}
                  </div>
                ) : (
                  <StrategicKPIs data={filteredRows} />
                )}
              </section>

              {/* Analytics Summary */}
              <section>
                <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                  🎯 Resumen Analítico
                </h2>
                {isLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-24 rounded-xl bg-secondary" />
                    ))}
                  </div>
                ) : (
                  <AnalyticsSummary data={filteredRows} />
                )}
              </section>

              {/* Charts Grid */}
              <section>
                <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                  📈 Análisis Visual
                </h2>
                {isLoading ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-[300px] rounded-xl bg-secondary" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <InvestmentLeadsChart data={filteredRows} />
                    <CTRByCountryChart data={filteredRows} />
                    <InvestmentByChannelChart data={filteredRows} />
                    <CPAByCountryChart data={filteredRows} />
                  </div>
                )}
              </section>

              {/* Detailed Table */}
              <section>
                <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                  📋 Tabla Detallada de Pauta
                </h2>
                {isLoading ? (
                  <Skeleton className="h-[400px] rounded-xl bg-secondary" />
                ) : (
                  <PautaTable data={filteredRows} onRefresh={refetch} />
                )}
              </section>
            </div>
          </main>

          <footer className="text-center py-6 border-t border-border">
            <div className="flex flex-col items-center gap-1">
              <p className="text-sm font-medium text-foreground">Grupo Effi</p>
              <p className="text-xs text-muted-foreground">
                © 2025 · Dashboard Estratégico de Pauta · Datos actualizados cada 5 minutos
              </p>
            </div>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default StrategicDashboard;
