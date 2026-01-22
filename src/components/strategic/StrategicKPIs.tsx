import { DollarSign, Users, MousePointer, Target, TrendingUp, Globe } from "lucide-react";
import { KPICard } from "@/components/ui/kpi-card";
import { CURRENCY_SYMBOLS } from "@/hooks/useCurrencyConverter";

interface MetricRow {
  fecha: string;
  leads: number;
  inversion: number;
  cpl: number;
  ctr: number;
  impresiones?: number;
  clicks?: number;
  pais: string;
  cpa?: number;
  canal?: string;
  moneda?: string;
}

export interface StrategicKPIsProps {
  data: MetricRow[];
  currency?: string;
}

export function StrategicKPIs({ data, currency = "USD" }: StrategicKPIsProps) {
  // Calculate aggregated KPIs
  const totalInversion = data.reduce((sum, row) => sum + row.inversion, 0);
  const totalLeads = data.reduce((sum, row) => sum + row.leads, 0);
  const totalImpresiones = data.reduce((sum, row) => sum + (row.impresiones || 0), 0);
  const totalClicks = data.reduce((sum, row) => sum + (row.clicks || 0), 0);
  
  // Weighted average CTR
  const avgCTR = totalImpresiones > 0 
    ? (totalClicks / totalImpresiones) * 100 
    : 0;
  
  // Average CPA
  const avgCPA = totalLeads > 0 ? totalInversion / totalLeads : 0;
  
  // ROAS calculation (simplified - would need revenue data for real ROAS)
  const roas = totalInversion > 0 ? (totalLeads * avgCPA * 1.5) / totalInversion : 0; // Estimated
  
  // ROI by Country
  const countryStats = data.reduce((acc, row) => {
    if (!acc[row.pais]) {
      acc[row.pais] = { leads: 0, inversion: 0 };
    }
    acc[row.pais].leads += row.leads;
    acc[row.pais].inversion += row.inversion;
    return acc;
  }, {} as Record<string, { leads: number; inversion: number }>);
  
  const bestCountryByROI = Object.entries(countryStats)
    .map(([pais, stats]) => ({
      pais,
      roi: stats.inversion > 0 ? stats.leads / stats.inversion : 0
    }))
    .sort((a, b) => b.roi - a.roi)[0];

  const symbol = CURRENCY_SYMBOLS[currency] || "$";

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `${symbol}${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${symbol}${(value / 1000).toFixed(1)}K`;
    return `${symbol}${value.toFixed(2)}`;
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <KPICard
        title="Inversión Total"
        value={formatCurrency(totalInversion)}
        icon={DollarSign}
        description="Suma de inversiones"
        variant="primary"
      />
      <KPICard
        title="Resultados Totales"
        value={totalLeads.toLocaleString()}
        icon={Users}
        description="Conversiones capturadas"
        variant="success"
      />
      <KPICard
        title="CTR Promedio"
        value={`${avgCTR.toFixed(2)}%`}
        icon={MousePointer}
        description="Ponderado por impresiones"
        variant="default"
      />
      <KPICard
        title="Costo/Resultado"
        value={formatCurrency(avgCPA)}
        icon={Target}
        description="Promedio por conversión"
        variant="warning"
      />
      <KPICard
        title="ROAS Estimado"
        value={`${roas.toFixed(2)}x`}
        icon={TrendingUp}
        description="Retorno sobre inversión"
        variant="primary"
      />
      <KPICard
        title="Mejor ROI"
        value={bestCountryByROI?.pais || "N/A"}
        icon={Globe}
        description={bestCountryByROI ? `${(bestCountryByROI.roi * 1000).toFixed(2)} res/$K` : "Sin datos"}
        variant="success"
      />
    </div>
  );
}
