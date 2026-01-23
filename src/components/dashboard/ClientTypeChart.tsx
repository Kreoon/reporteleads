import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { CommercialRow } from "@/hooks/useCommercials";

interface ClientTypeChartProps {
  data: CommercialRow[];
}

const TYPE_CONFIG = [
  { key: "mercaderiaPropia", label: "Mercadería Propia", color: "#ef4444" },
  { key: "freeEcommerce", label: "Free Ecommerce", color: "#f97316" },
  { key: "dropshipping", label: "Dropshipping", color: "#eab308" },
  { key: "serviciosEffi", label: "Servicios Effi", color: "#22c55e" },
  { key: "mixto", label: "Mixto", color: "#06b6d4" },
];

export function ClientTypeChart({ data }: ClientTypeChartProps) {
  // Aggregate all client type values
  const totals = data.reduce(
    (acc, row) => {
      acc.mercaderiaPropia += row.mercaderiaPropia ?? 0;
      acc.freeEcommerce += row.freeEcommerce ?? 0;
      acc.dropshipping += row.dropshipping ?? 0;
      acc.serviciosEffi += row.serviciosEffi ?? 0;
      acc.mixto += row.mixto ?? 0;
      return acc;
    },
    {
      mercaderiaPropia: 0,
      freeEcommerce: 0,
      dropshipping: 0,
      serviciosEffi: 0,
      mixto: 0,
    }
  );

  const chartData = TYPE_CONFIG.map((type) => ({
    name: type.label,
    value: totals[type.key as keyof typeof totals],
    color: type.color,
  })).filter(item => item.value > 0);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (chartData.length === 0 || total === 0) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-foreground">
            Tipos de Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-3 flex items-center justify-center h-[220px]">
          <p className="text-muted-foreground text-sm">Sin datos de tipos</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-foreground">
          Tipos de Cliente
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-3">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => 
                percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''
              }
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--foreground))",
                fontSize: "12px",
              }}
              formatter={(value: number, name: string) => [
                `${value} (${((value / total) * 100).toFixed(1)}%)`,
                name,
              ]}
            />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              wrapperStyle={{ fontSize: "10px", paddingLeft: "10px" }}
              formatter={(value) => (
                <span style={{ color: "hsl(var(--foreground))" }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
