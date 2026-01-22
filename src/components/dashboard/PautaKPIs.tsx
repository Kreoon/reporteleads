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
  isLoading?: boolean;
}

export function PautaKPIs({ data, commercialsData = [], isLoading }: PautaKPIsProps) {
  // Aggregate totals from pauta
  const totalLeads = data.reduce((acc, row) => acc + row.leads, 0);
  const totalInversion = data.reduce((acc, row) => acc + row.inversion, 0);
  const totalImpresiones = data.reduce((acc, row) => acc + (row.impresiones || 0), 0);
  const totalClicks = data.reduce((acc, row) => acc + (row.clicks || 0), 0);

  // Aggregate revenue from commercials (real closed deals)
  const totalRevenue = commercialsData.reduce((acc, row) => acc + row.montoTotal, 0);

  // Averages
  const avgCPL = data.length > 0 && totalLeads > 0 ? totalInversion / totalLeads : 0;
  const avgCTR = data.length > 0 ? data.reduce((acc, row) => acc + row.ctr, 0) / data.length : 0;

  // REAL ROAS: Revenue from closed deals / Ad Investment
  const roas = totalInversion > 0 ? totalRevenue / totalInversion : 0;

  // Cost per Click (CPC)
  const cpc = totalClicks > 0 ? totalInversion / totalClicks : 0;

  // Conversion Rate (Clicks to Leads)
  const conversionRate = totalClicks > 0 ? (totalLeads / totalClicks) * 100 : 0;

  // Cost per Mille (CPM)
  const cpm = totalImpresiones > 0 ? (totalInversion / totalImpresiones) * 1000 : 0;

  if (isLoading) {
    return null; // Parent handles skeleton
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
      <KPICard
        title="Leads"
        value={totalLeads.toLocaleString()}
        icon={Users}
        variant="primary"
        compact
      />
      <KPICard
        title="Inversión"
        value={`$${totalInversion.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
        icon={DollarSign}
        variant="success"
        compact
      />
      <KPICard
        title="Costo/Resultado"
        value={`$${avgCPL.toFixed(2)}`}
        icon={Target}
        variant="warning"
        compact
      />
      <KPICard
        title="CTR"
        value={`${avgCTR.toFixed(2)}%`}
        icon={MousePointerClick}
        variant="default"
        compact
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
