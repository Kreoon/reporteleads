import { Users, TrendingUp, DollarSign, Award } from "lucide-react";
import { KPICard } from "@/components/ui/kpi-card";
import { CommercialRow } from "@/hooks/useCommercials";

interface CommercialsKPIsProps {
  data: CommercialRow[];
}

export function CommercialsKPIs({ data }: CommercialsKPIsProps) {
  // Calculate KPIs
  const totalContactos = data.reduce((acc, row) => acc + (row.contactos ?? 0), 0);
  const totalCerradas = data.reduce((acc, row) => acc + (row.cuentasCerradas ?? 0), 0);
  const totalMonto = data.reduce((acc, row) => acc + (row.montoTotal ?? 0), 0);
  
  const tasaCierre = totalContactos > 0 
    ? ((totalCerradas / totalContactos) * 100).toFixed(1) 
    : "0.0";
  
  // Find top commercial by cuentas cerradas
  const topComercial = data.length > 0 
    ? data.reduce((prev, current) => 
        (current.cuentasCerradas ?? 0) > (prev.cuentasCerradas ?? 0) ? current : prev
      ).comercial
    : "—";

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <KPICard
        title="Contactos"
        value={totalContactos.toLocaleString()}
        icon={Users}
        variant="primary"
        compact
      />
      <KPICard
        title="Cierre"
        value={`${tasaCierre}%`}
        icon={TrendingUp}
        variant="success"
        compact
      />
      <KPICard
        title="Facturado"
        value={`$${totalMonto >= 1000 ? (totalMonto / 1000).toFixed(1) + 'K' : totalMonto.toFixed(0)}`}
        icon={DollarSign}
        variant="warning"
        compact
      />
      <KPICard
        title="Top"
        value={topComercial.split(' ')[0]}
        icon={Award}
        variant="default"
        compact
      />
    </div>
  );
}
