import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { CommercialRow } from "@/hooks/useCommercials";

interface LeadStatusChartProps {
  data: CommercialRow[];
}

const STATUS_CONFIG = [
  { key: "cuentasCerradas", label: "Cerrado", color: "#22c55e" },
  { key: "procesoCierre", label: "Proceso de Cierre", color: "#a855f7" },
  { key: "cuentasDescartadas", label: "Descartado", color: "#ef4444" },
  { key: "cuentasGestion", label: "Gestión", color: "#3b82f6" },
  { key: "cuentasPendiente", label: "Pendiente de Respuesta", color: "#06b6d4" },
  { key: "clienteRegistrado", label: "Cliente Registrado", color: "#84cc16" },
  { key: "noInteresado", label: "No Interesado", color: "#f97316" },
];

export function LeadStatusChart({ data }: LeadStatusChartProps) {
  // Aggregate all status values
  const totals = data.reduce(
    (acc, row) => {
      acc.cuentasCerradas += row.cuentasCerradas ?? 0;
      acc.procesoCierre += row.procesoCierre ?? 0;
      acc.cuentasDescartadas += row.cuentasDescartadas ?? 0;
      acc.cuentasGestion += row.cuentasGestion ?? 0;
      acc.cuentasPendiente += row.cuentasPendiente ?? 0;
      acc.clienteRegistrado += row.clienteRegistrado ?? 0;
      acc.noInteresado += row.noInteresado ?? 0;
      return acc;
    },
    {
      cuentasCerradas: 0,
      procesoCierre: 0,
      cuentasDescartadas: 0,
      cuentasGestion: 0,
      cuentasPendiente: 0,
      clienteRegistrado: 0,
      noInteresado: 0,
    }
  );

  const chartData = STATUS_CONFIG.map((status) => ({
    name: status.label,
    value: totals[status.key as keyof typeof totals],
    color: status.color,
  })).filter(item => item.value > 0);

  if (chartData.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-foreground">
            Estados de Leads
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-3 flex items-center justify-center h-[220px]">
          <p className="text-muted-foreground text-sm">Sin datos de estados</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-foreground">
          Estados de Leads
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-3">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} horizontal={false} />
            <XAxis
              type="number"
              stroke="hsl(var(--muted-foreground))"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={9}
              tickLine={false}
              axisLine={false}
              width={90}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(220 25% 12%)",
                border: "1px solid hsl(220 20% 25%)",
                borderRadius: "8px",
                color: "#ffffff",
                fontSize: "12px",
                padding: "8px 12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              }}
              labelStyle={{ color: "#ffffff", fontWeight: 600, marginBottom: "4px" }}
              formatter={(value: number, name: string) => [
                <span key="value" style={{ color: "#ffffff", fontWeight: 500 }}>{value} leads</span>,
                null
              ]}
              labelFormatter={(label) => (
                <span style={{ color: "#ffffff", fontWeight: 600 }}>{label}</span>
              )}
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
