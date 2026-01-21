import { Users, DollarSign, Target, MousePointerClick } from "lucide-react";
import { Header } from "@/components/dashboard/Header";
import { KPICard } from "@/components/ui/kpi-card";
import { LeadsChart } from "@/components/dashboard/LeadsChart";
import { InvestmentChart } from "@/components/dashboard/InvestmentChart";
import { MetricsTable } from "@/components/dashboard/MetricsTable";
import { useMetrics } from "@/hooks/useMetrics";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { data, isLoading, lastUpdated, refetch } = useMetrics();

  return (
    <div className="min-h-screen bg-background">
      <Header 
        lastUpdated={lastUpdated} 
        isLoading={isLoading} 
        onRefresh={refetch} 
      />
      
      <main className="container mx-auto px-4 py-8">
        {/* KPI Cards */}
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
                value={data?.todayLeads || 0}
                icon={Users}
                variant="primary"
                trend={{ value: 12.5, isPositive: true }}
              />
              <KPICard
                title="Inversión Total (Hoy)"
                value={`$${(data?.todayInversion || 0).toLocaleString()}`}
                icon={DollarSign}
                variant="success"
                trend={{ value: 8.3, isPositive: true }}
              />
              <KPICard
                title="CPL Promedio"
                value={`$${(data?.avgCPL || 0).toFixed(2)}`}
                icon={Target}
                variant="warning"
                trend={{ value: 5.2, isPositive: false }}
              />
              <KPICard
                title="CTR Promedio"
                value={`${(data?.avgCTR || 0).toFixed(2)}%`}
                icon={MousePointerClick}
                variant="default"
                trend={{ value: 3.1, isPositive: true }}
              />
            </>
          )}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {isLoading ? (
            <>
              <Skeleton className="h-[380px] rounded-xl bg-secondary" />
              <Skeleton className="h-[380px] rounded-xl bg-secondary" />
            </>
          ) : (
            <>
              <LeadsChart data={data?.rows || []} />
              <InvestmentChart data={data?.rows || []} />
            </>
          )}
        </div>

        {/* Table */}
        <div className="mb-8">
          {isLoading ? (
            <Skeleton className="h-[400px] rounded-xl bg-secondary" />
          ) : (
            <MetricsTable data={data?.rows || []} />
          )}
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
