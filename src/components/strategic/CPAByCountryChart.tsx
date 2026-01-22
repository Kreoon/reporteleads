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

interface MetricRow {
  pais: string;
  inversion: number;
  leads: number;
}

interface CPAByCountryChartProps {
  data: MetricRow[];
}

const COUNTRY_NAMES: Record<string, string> = {
  EC: "Ecuador",
  GT: "Guatemala",
  COL: "Colombia",
  RD: "Rep. Dom.",
  CR: "Costa Rica",
};

const COLORS = ["#22c55e", "#84cc16", "#eab308", "#f97316", "#ef4444"];

export function CPAByCountryChart({ data }: CPAByCountryChartProps) {
  // Calculate CPA by country (total investment / total leads)
  const countryStats = data.reduce((acc, row) => {
    if (!acc[row.pais]) {
      acc[row.pais] = { inversion: 0, leads: 0 };
    }
    acc[row.pais].inversion += row.inversion;
    acc[row.pais].leads += row.leads;
    return acc;
  }, {} as Record<string, { inversion: number; leads: number }>);

  const chartData = Object.entries(countryStats)
    .map(([pais, stats]) => ({
      pais: COUNTRY_NAMES[pais] || pais,
      cpa: stats.leads > 0 ? stats.inversion / stats.leads : 0,
    }))
    .filter((d) => d.cpa > 0)
    .sort((a, b) => a.cpa - b.cpa); // Lower CPA is better, so sort ascending

  return (
    <Card className="glass-card border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Costo/Resultado por País (Menor = Mejor)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="pais"
                tick={{ fontSize: 11 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(v) => `$${v.toFixed(0)}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, "Costo/Res"]}
              />
              <Bar dataKey="cpa" radius={[4, 4, 0, 0]}>
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
