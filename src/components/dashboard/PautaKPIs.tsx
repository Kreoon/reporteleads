import {
  Users,
  DollarSign,
  Target,
  MousePointerClick,
  TrendingUp,
  Eye,
  Percent,
  BarChart3,
} from "lucide-react";
import { KPICard } from "@/components/ui/kpi-card";

interface MetricRow {
  fecha: string;
  leads: number;
  inversion: number;
  cpl: number;
  ctr: number;
  impresiones?: number;
  clicks?: number;
  pais: string;
}

interface CommercialRow {
  comercial: string;
  pais: string;
  contactos: number;
  cuentasCerradas: number;
  cuentasGestion: number;
  cuentasPendiente: number;
  cuentasDescartadas: number;
  montoTotal: number;
}

interface PautaKPIsProps {
  data: MetricRow[];
  commercialsData?: CommercialRow[];
  previousData?: MetricRow[];
  isLoading?: boolean;
}

function calcDelta(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

export function PautaKPIs({ data, commercialsData = [], previousData, isLoading }: PautaKPIsProps) {
  const totalLeads = data.reduce((acc, row) => acc + row.leads, 0);
  const totalInversion = data.reduce((acc, row) => acc + row.inversion, 0);
  const totalImpresiones = data.reduce((acc, row) => acc + (row.impresiones || 0), 0);
  const totalClicks = data.reduce((acc, row) => acc + (row.clicks || 0), 0);
  const totalRevenue = commercialsData.reduce((acc, row) => acc + row.montoTotal, 0);

  const avgCPL = data.length > 0 && totalLeads > 0 ? totalInversion / totalLeads : 0;
  const avgCTR = data.length > 0 ? data.reduce((acc, row) => acc + row.ctr, 0) / data.length : 0;
  const roas = totalInversion > 0 ? totalRevenue / totalInversion : 0;
  const cpc = totalClicks > 0 ? totalInversion / totalClicks : 0;
  const conversionRate = totalClicks > 0 ? (totalLeads / totalClicks) * 100 : 0;

  // Métricas del período anterior para tendencias
  const prevLeads = previousData ? previousData.reduce((acc, r) => acc + r.leads, 0) : 0;
  const prevInversion = previousData ? previousData.reduce((acc, r) => acc + r.inversion, 0) : 0;
  const prevCPL = previousData && previousData.length > 0 && prevLeads > 0 ? prevInversion / prevLeads : 0;
  const prevCTR = previousData && previousData.length > 0
    ? previousData.reduce((acc, r) => acc + r.ctr, 0) / previousData.length
    : 0;

  const hasPrevious = previousData && previousData.length > 0;
  const leadsΔ = hasPrevious ? calcDelta(totalLeads, prevLeads) : null;
  const inversionΔ = hasPrevious ? calcDelta(totalInversion, prevInversion) : null;
  const cplΔ = hasPrevious ? calcDelta(avgCPL, prevCPL) : null;
  const ctrΔ = hasPrevious ? calcDelta(avgCTR, prevCTR) : null;

  if (isLoading) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
      <KPICard
        title="Leads"
        value={totalLeads.toLocaleString()}
        icon={Users}
        variant="primary"
        compact
        trend={leadsΔ !== null ? { value: Math.abs(leadsΔ), isPositive: leadsΔ > 0 } : undefined}
      />
      <KPICard
        title="Inversión"
        value={`$${totalInversion.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
        icon={DollarSign}
        variant="success"
        compact
        trend={inversionΔ !== null ? { value: Math.abs(inversionΔ), isPositive: inversionΔ < 0 } : undefined}
      />
      <KPICard
        title="Costo/Resultado"
        value={`$${avgCPL.toFixed(2)}`}
        icon={Target}
        variant="warning"
        compact
        trend={cplΔ !== null ? { value: Math.abs(cplΔ), isPositive: cplΔ < 0 } : undefined}
      />
      <KPICard
        title="CTR"
        value={`${avgCTR.toFixed(2)}%`}
        icon={MousePointerClick}
        variant="default"
        compact
        trend={ctrΔ !== null ? { value: Math.abs(ctrΔ), isPositive: ctrΔ > 0 } : undefined}
      />
      <KPICard
        title="ROAS"
        value={`${roas.toFixed(2)}x`}
        icon={TrendingUp}
        variant={roas >= 1 ? "success" : "warning"}
        compact
      />
      <KPICard
        title="Impresiones"
        value={totalImpresiones >= 1000 ? `${(totalImpresiones / 1000).toFixed(1)}K` : totalImpresiones.toLocaleString()}
        icon={Eye}
        variant="default"
        compact
      />
      <KPICard
        title="CPC"
        value={`$${cpc.toFixed(2)}`}
        icon={BarChart3}
        variant="default"
        compact
      />
      <KPICard
        title="Conv."
        value={`${conversionRate.toFixed(1)}%`}
        icon={Percent}
        variant={conversionRate >= 10 ? "success" : "warning"}
        compact
      />
    </div>
  );
}
