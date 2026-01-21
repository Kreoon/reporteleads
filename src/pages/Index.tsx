import { useState, useMemo } from "react";
import { Users, DollarSign, Target, MousePointerClick } from "lucide-react";
import { Header } from "@/components/dashboard/Header";
import { KPICard } from "@/components/ui/kpi-card";
import { LeadsChart } from "@/components/dashboard/LeadsChart";
import { InvestmentChart } from "@/components/dashboard/InvestmentChart";
import { MetricsTable } from "@/components/dashboard/MetricsTable";
import { CommercialsTable } from "@/components/dashboard/CommercialsTable";
import { CommercialsChart } from "@/components/dashboard/CommercialsChart";
import { CommercialsKPIs } from "@/components/dashboard/CommercialsKPIs";
import { DateFilters } from "@/components/dashboard/DateFilters";
import { useMetrics } from "@/hooks/useMetrics";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const COUNTRIES = [
  { code: "EC", name: "Ecuador" },
  { code: "GT", name: "Guatemala" },
  { code: "COL", name: "Colombia" },
  { code: "RD", name: "Rep. Dominicana" },
  { code: "CR", name: "Costa Rica" },
];

// Parse fecha string "DD Mes" to comparable date
const parseFechaToDate = (fechaStr: string): Date | null => {
  try {
    const months: Record<string, number> = {
      'Ene': 0, 'Feb': 1, 'Mar': 2, 'Abr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Ago': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dic': 11
    };
    const parts = fechaStr.split(' ');
    if (parts.length !== 2) return null;
    const day = parseInt(parts[0], 10);
    const month = months[parts[1]];
    if (isNaN(day) || month === undefined) return null;
    const year = new Date().getFullYear();
    return new Date(year, month, day);
  } catch {
    return null;
  }
};

const Index = () => {
  const { data, isLoading, lastUpdated, refetch } = useMetrics();
  const [selectedCountry, setSelectedCountry] = useState("EC");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [selectedMonth, setSelectedMonth] = useState("all");

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
  }, [data?.rows, selectedCountry, dateRange, selectedMonth]);

  // Filter commercials by country and date filters
  const filteredCommercials = useMemo(() => {
    let commercials = data?.commercials?.filter(row => row.pais === selectedCountry) || [];
    
    // Filter by date range (if commercials have fecha field)
    if (dateRange.from || dateRange.to) {
      commercials = commercials.filter(row => {
        if (!row.fecha) return true; // Keep rows without date
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
    
    // Filter by month (if commercials have fecha field)
    if (selectedMonth !== "all") {
      commercials = commercials.filter(row => {
        if (!row.fecha) return true; // Keep rows without date
        const rowDate = parseFechaToDate(row.fecha);
        if (!rowDate) return true;
        const monthStr = String(rowDate.getMonth() + 1).padStart(2, '0');
        return monthStr === selectedMonth;
      });
    }
    
    return commercials;
  }, [data?.commercials, selectedCountry, dateRange, selectedMonth]);
  
  // Calculate KPIs based on filtered data
  const todayData = filteredRows[filteredRows.length - 1] || filteredRows[0];
  const avgCPL = filteredRows.length > 0 
    ? filteredRows.reduce((acc, row) => acc + row.cpl, 0) / filteredRows.length 
    : 0;
  const avgCTR = filteredRows.length > 0 
    ? filteredRows.reduce((acc, row) => acc + row.ctr, 0) / filteredRows.length 
    : 0;

  const handleClearFilters = () => {
    setDateRange({ from: undefined, to: undefined });
    setSelectedMonth("all");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        lastUpdated={lastUpdated} 
        isLoading={isLoading} 
        onRefresh={refetch} 
      />
      
      <main className="container mx-auto px-4 py-8">
        {/* Country Tabs */}
        <Tabs value={selectedCountry} onValueChange={setSelectedCountry} className="mb-6">
          <TabsList className="grid w-full grid-cols-5 bg-secondary/50 backdrop-blur-sm">
            {COUNTRIES.map((country) => (
              <TabsTrigger 
                key={country.code} 
                value={country.code}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <span className="hidden sm:inline">{country.name}</span>
                <span className="sm:hidden">{country.code}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Date Filters */}
        <DateFilters
          dateRange={dateRange}
          selectedMonth={selectedMonth}
          onDateRangeChange={setDateRange}
          onMonthChange={setSelectedMonth}
          onClearFilters={handleClearFilters}
        />

        {/* KPI Cards - Pauta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {isLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl bg-secondary" />
              ))}
            </>
          ) : (
            <>
              <KPICard
                title="Total Leads (Hoy)"
                value={todayData?.leads || 0}
                icon={Users}
                variant="primary"
                trend={{ value: 12.5, isPositive: true }}
              />
              <KPICard
                title="Inversión Total (Hoy)"
                value={`$${(todayData?.inversion || 0).toLocaleString()}`}
                icon={DollarSign}
                variant="success"
                trend={{ value: 8.3, isPositive: true }}
              />
              <KPICard
                title="CPL Promedio"
                value={`$${avgCPL.toFixed(2)}`}
                icon={Target}
                variant="warning"
                trend={{ value: 5.2, isPositive: false }}
              />
              <KPICard
                title="CTR Promedio"
                value={`${avgCTR.toFixed(2)}%`}
                icon={MousePointerClick}
                variant="default"
                trend={{ value: 3.1, isPositive: true }}
              />
            </>
          )}
        </div>

        {/* Charts - Pauta */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {isLoading ? (
            <>
              <Skeleton className="h-[380px] rounded-xl bg-secondary" />
              <Skeleton className="h-[380px] rounded-xl bg-secondary" />
            </>
          ) : (
            <>
              <LeadsChart data={filteredRows} />
              <InvestmentChart data={filteredRows} />
            </>
          )}
        </div>

        {/* Table - Pauta */}
        <div className="mb-8">
          {isLoading ? (
            <Skeleton className="h-[400px] rounded-xl bg-secondary" />
          ) : (
            <MetricsTable data={filteredRows} />
          )}
        </div>

        {/* Commercials Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            📊 Performance de Comerciales
          </h2>

          {/* Commercials KPIs */}
          <div className="mb-6">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-xl bg-secondary" />
                ))}
              </div>
            ) : (
              <CommercialsKPIs data={filteredCommercials} />
            )}
          </div>

          {/* Commercials Chart */}
          <div className="mb-6">
            {isLoading ? (
              <Skeleton className="h-[380px] rounded-xl bg-secondary" />
            ) : (
              <CommercialsChart data={filteredCommercials} />
            )}
          </div>

          {/* Commercials Table */}
          <div className="mb-8">
            {isLoading ? (
              <Skeleton className="h-[400px] rounded-xl bg-secondary" />
            ) : (
              <CommercialsTable data={filteredCommercials} />
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center py-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            © 2024 EFFI Commerce · Los datos se actualizan automáticamente cada 5 minutos
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
