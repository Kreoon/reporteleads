import { useState } from "react";
import { Users, DollarSign, Target, MousePointerClick, WifiOff } from "lucide-react";
import { Header } from "@/components/dashboard/Header";
import { KPICard } from "@/components/ui/kpi-card";
import { LeadsChart } from "@/components/dashboard/LeadsChart";
import { InvestmentChart } from "@/components/dashboard/InvestmentChart";
import { MetricsTable } from "@/components/dashboard/MetricsTable";
import { CommercialsTable } from "@/components/dashboard/CommercialsTable";
import { CommercialsChart } from "@/components/dashboard/CommercialsChart";
import { CommercialsKPIs } from "@/components/dashboard/CommercialsKPIs";
import { useMetrics } from "@/hooks/useMetrics";
import { useCommercials } from "@/hooks/useCommercials";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const COUNTRIES = [
  { code: "EC", name: "Ecuador" },
  { code: "GT", name: "Guatemala" },
  { code: "COL", name: "Colombia" },
  { code: "RD", name: "Rep. Dominicana" },
  { code: "CR", name: "Costa Rica" },
];

const Index = () => {
  const { data, isLoading, error, lastUpdated, refetch } = useMetrics();
  const { 
    data: commercialsData, 
    isLoading: commercialsLoading, 
    error: commercialsError,
    refetch: refetchCommercials 
  } = useCommercials();
  
  const [selectedCountry, setSelectedCountry] = useState("EC");

  // Handler to refresh both metrics and commercials
  const handleRefresh = async () => {
    await Promise.all([refetch(), refetchCommercials()]);
  };

  // Filtrar datos por país seleccionado
  const filteredRows = data?.rows?.filter(row => row.pais === selectedCountry) || [];
  const filteredCommercials = commercialsData?.rows?.filter(row => row.pais === selectedCountry) || [];
  
  // Calcular KPIs basados en datos filtrados
  const todayData = filteredRows[filteredRows.length - 1] || filteredRows[0];
  const avgCPL = filteredRows.length > 0 
    ? filteredRows.reduce((acc, row) => acc + row.cpl, 0) / filteredRows.length 
    : 0;
  const avgCTR = filteredRows.length > 0 
    ? filteredRows.reduce((acc, row) => acc + row.ctr, 0) / filteredRows.length 
    : 0;

  const hasError = error || commercialsError;

  return (
    <div className="min-h-screen bg-background">
      <Header 
        lastUpdated={lastUpdated} 
        isLoading={isLoading || commercialsLoading} 
        onRefresh={handleRefresh} 
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

        {/* Error Alert */}
        {hasError && (
          <Alert variant="destructive" className="mb-6 bg-destructive/10 border-destructive/50">
            <WifiOff className="h-4 w-4" />
            <AlertTitle>Sin conexión</AlertTitle>
            <AlertDescription>
              {error || commercialsError}. Mostrando datos de respaldo.
            </AlertDescription>
          </Alert>
        )}

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
            {commercialsLoading ? (
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
            {commercialsLoading ? (
              <Skeleton className="h-[380px] rounded-xl bg-secondary" />
            ) : (
              <CommercialsChart data={filteredCommercials} />
            )}
          </div>

          {/* Commercials Table */}
          <div className="mb-8">
            {commercialsLoading ? (
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
