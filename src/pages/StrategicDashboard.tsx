import { useState, useMemo } from "react";
import { StrategicHeader } from "@/components/strategic/StrategicHeader";
import { StrategicKPIs } from "@/components/strategic/StrategicKPIs";
import { PautaTable } from "@/components/strategic/PautaTable";
import { CostPerResultTrendChart } from "@/components/strategic/CostPerResultTrendChart";
import { PerformanceByChannelChart } from "@/components/strategic/PerformanceByChannelChart";
import { InvestmentByChannelChart } from "@/components/strategic/InvestmentByChannelChart";
import { PerformanceByCampaignTypeChart } from "@/components/strategic/PerformanceByCampaignTypeChart";
import { AnalyticsSummary } from "@/components/strategic/AnalyticsSummary";
import { StrategicFilters } from "@/components/strategic/StrategicFilters";
import { useMetrics, MetricRow } from "@/hooks/useMetrics";
import { parseDate } from "@/hooks/useDateFilters";
import { useCurrencyConverter } from "@/hooks/useCurrencyConverter";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CountryFlag } from "@/components/ui/country-flag";

const COUNTRIES = [
  { code: "EC", name: "Ecuador" },
  { code: "GT", name: "Guatemala" },
  { code: "COL", name: "Colombia" },
  { code: "RD", name: "Rep. Dominicana" },
  { code: "CR", name: "Costa Rica" },
];

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
  const { convert, getCurrencyForCountry } = useCurrencyConverter();
  
  const [selectedCountry, setSelectedCountry] = useState("EC");
  const [filters, setFilters] = useState<StrategicFiltersState>({
    dateFrom: undefined,
    dateTo: undefined,
    countries: [],
    channels: [],
    campaignTypes: [],
    sortBy: "fecha",
    sortOrder: "desc",
  });

  const [groupByCampaign, setGroupByCampaign] = useState(false);

  // Get countries with data
  const countriesWithData = useMemo(() => {
    const pautaCountries = new Set(data?.rows?.map(r => r.pais) || []);
    return COUNTRIES.filter(c => pautaCountries.has(c.code));
  }, [data?.rows]);

  // Get target currency based on selected country
  const targetCurrency = useMemo(() => {
    return getCurrencyForCountry(selectedCountry);
  }, [selectedCountry, getCurrencyForCountry]);

  // Get unique values for filter options (from selected country data)
  const filterOptions = useMemo(() => {
    const rows = data?.rows?.filter(r => r.pais === selectedCountry) || [];
    return {
      countries: [...new Set(rows.map(r => r.pais))].filter(Boolean),
      channels: [...new Set(rows.map(r => r.canal))].filter(Boolean) as string[],
      campaignTypes: [...new Set(rows.map(r => r.tipoCampana))].filter(Boolean) as string[],
    };
  }, [data?.rows, selectedCountry]);

  // Filter and process data for selected country

  // Filter and sort data with optional grouping
  const filteredRows = useMemo(() => {
    // First filter by selected country tab
    let rows = (data?.rows || []).filter(row => row.pais === selectedCountry);
    
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
    
    // Channel filter
    if (filters.channels.length > 0) {
      rows = rows.filter(row => row.canal && filters.channels.includes(row.canal));
    }
    
    // Campaign type filter
    if (filters.campaignTypes.length > 0) {
      rows = rows.filter(row => row.tipoCampana && filters.campaignTypes.includes(row.tipoCampana));
    }

    // Convert currencies to target
    rows = rows.map(row => {
      const fromCurrency = row.moneda || "USD";
      if (fromCurrency === targetCurrency) return row;
      
      return {
        ...row,
        inversion: convert(row.inversion, fromCurrency, targetCurrency),
        cpl: convert(row.cpl, fromCurrency, targetCurrency),
        cpa: row.cpa ? convert(row.cpa, fromCurrency, targetCurrency) : undefined,
        cpc: row.cpc ? convert(row.cpc, fromCurrency, targetCurrency) : undefined,
        moneda: targetCurrency,
      };
    });

    // Group by campaign name if enabled
    if (groupByCampaign) {
      const grouped = rows.reduce((acc, row) => {
        const key = row.campana || row.canal || "Sin campaña";
        if (!acc[key]) {
          acc[key] = {
            ...row,
            campana: key,
            leads: 0,
            inversion: 0,
            impresiones: 0,
            clicks: 0,
            alcance: 0,
            _count: 0,
            _ctrSum: 0,
          };
        }
        acc[key].leads += row.leads;
        acc[key].inversion += row.inversion;
        acc[key].impresiones = (acc[key].impresiones || 0) + (row.impresiones || 0);
        acc[key].clicks = (acc[key].clicks || 0) + (row.clicks || 0);
        acc[key].alcance = (acc[key].alcance || 0) + (row.alcance || 0);
        acc[key]._count += 1;
        acc[key]._ctrSum += row.ctr;
        return acc;
      }, {} as Record<string, MetricRow & { _count: number; _ctrSum: number }>);

      rows = Object.values(grouped).map(g => ({
        ...g,
        ctr: g._ctrSum / g._count,
        cpl: g.leads > 0 ? g.inversion / g.leads : 0,
        cpa: g.leads > 0 ? g.inversion / g.leads : undefined,
      }));
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
  }, [data?.rows, selectedCountry, filters, groupByCampaign, targetCurrency, convert]);

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

          {/* Sticky Country Tabs Bar */}
          <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
            <div className="container mx-auto px-4 py-3">
              <Tabs value={selectedCountry} onValueChange={setSelectedCountry}>
                <TabsList className="grid w-full grid-cols-5 bg-secondary/50">
                  {COUNTRIES.map((country) => (
                    <TabsTrigger
                      key={country.code}
                      value={country.code}
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                    >
                      <CountryFlag code={country.code} size="md" />
                      <span className="hidden sm:inline ml-1.5">{country.name}</span>
                      <span className="sm:hidden ml-1">{country.code}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            <div className="max-w-[1800px] mx-auto space-y-6">
              {/* KPIs Section */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    📊 KPIs en Tiempo Real
                    <span className="text-sm font-normal text-muted-foreground">
                      (en {targetCurrency})
                    </span>
                  </h2>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="group-campaign"
                        checked={groupByCampaign}
                        onCheckedChange={setGroupByCampaign}
                      />
                      <Label htmlFor="group-campaign" className="text-sm">
                        Agrupar por campaña
                      </Label>
                    </div>
                  </div>
                </div>
                {isLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {[...Array(6)].map((_, i) => (
                      <Skeleton key={i} className="h-28 rounded-xl bg-secondary" />
                    ))}
                  </div>
                ) : (
                  <StrategicKPIs data={filteredRows} currency={targetCurrency} />
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
                    <CostPerResultTrendChart data={filteredRows} currency={targetCurrency} />
                    <PerformanceByChannelChart data={filteredRows} currency={targetCurrency} />
                    <InvestmentByChannelChart data={filteredRows} />
                    <PerformanceByCampaignTypeChart data={filteredRows} currency={targetCurrency} />
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
