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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        title="Total Contactos"
        value={totalContactos.toLocaleString()}
        icon={Users}
        variant="primary"
      />
      <KPICard
        title="Tasa de Cierre"
        value={`${tasaCierre}%`}
        icon={TrendingUp}
        variant="success"
      />
      <KPICard
        title="Monto Total Facturado"
        value={`$${totalMonto.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        icon={DollarSign}
        variant="warning"
      />
      <KPICard
        title="Top Comercial"
        value={topComercial}
        icon={Award}
        variant="default"
      />
    </div>
  );
}
