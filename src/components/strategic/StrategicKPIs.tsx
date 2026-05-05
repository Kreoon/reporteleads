import { DollarSign, Users, MousePointer, Target, TrendingUp, Globe, Radio } from "lucide-react";
import { KPICard } from "@/components/ui/kpi-card";
import { CURRENCY_SYMBOLS } from "@/hooks/useCurrencyConverter";
import { CommercialRow } from "@/hooks/useCommercials";

interface MetricRow {
  fecha: string;
  leads: number;
  inversion: number;
  cpl: number;
  ctr: number;
  impresiones?: number;
  clicks?: number;
  alcance?: number;
  frecuencia?: number;
  pais: string;
  cpa?: number;
  canal?: string;
  moneda?: string;
}

export interface StrategicKPIsProps {
  data: MetricRow[];
  currency?: string;
  commercialsData?: CommercialRow[];
}

export function StrategicKPIs({ data, currency = "USD", commercialsData = [] }: StrategicKPIsProps) {
  const totalInversion = data.reduce((sum, row) => sum + row.inversion, 0);
  const totalLeads = data.reduce((sum, row) => sum + row.leads, 0);
  const totalImpresiones = data.reduce((sum, row) => sum + (row.impresiones || 0), 0);
  const totalClicks = data.reduce((sum, row) => sum + (row.clicks || 0), 0);
  const totalAlcance = data.reduce((sum, row) => sum + (row.alcance || 0), 0);

  const avgCTR = totalImpresiones > 0
    ? (totalClicks / totalImpresiones) * 100
    : 0;

  const avgCPA = totalLeads > 0 ? totalInversion / totalLeads : 0;

  // Frecuencia: impresiones/alcance si hay alcance, fallback a promedio simple del campo
  const avgFrecuencia = totalAlcance > 0
    ? totalImpresiones / totalAlcance
    : data.length > 0
      ? data.reduce((acc, r) => acc + (r.frecuencia ?? 0), 0) / data.length
      : 0;

  // ROAS real: ingresos registrados de ventas / inversión total
  const totalRevenue = commercialsData.reduce((sum, r) => sum + r.montoTotal, 0);
  const roas = totalInversion > 0 && totalRevenue > 0
    ? totalRevenue / totalInversion
    : null;

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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
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
        title="ROAS Real"
        value={roas !== null ? `${roas.toFixed(2)}x` : "Sin datos"}
        icon={TrendingUp}
        description={
          roas !== null
            ? roas >= 1 ? "Campaña rentable" : "Por debajo del umbral"
            : "Sin ingresos registrados"
        }
        variant={roas === null ? "default" : roas >= 1 ? "success" : "warning"}
      />
      <KPICard
        title="Mejor ROI"
        value={bestCountryByROI?.pais || "N/A"}
        icon={Globe}
        description={bestCountryByROI ? `${(bestCountryByROI.roi * 1000).toFixed(2)} res/$K` : "Sin datos"}
        variant="success"
      />
      <KPICard
        title="Frecuencia Prom."
        value={data.length > 0 ? avgFrecuencia.toFixed(2) : "N/A"}
        icon={Radio}
        description={avgFrecuencia > 3 ? "Posible fatiga creativa" : "Nivel saludable"}
        variant={avgFrecuencia > 3 ? "warning" : "default"}
      />
    </div>
  );
}
