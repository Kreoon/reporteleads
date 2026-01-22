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
  ctr: number;
  impresiones?: number;
  clicks?: number;
}

interface CTRByCountryChartProps {
  data: MetricRow[];
}

const COUNTRY_NAMES: Record<string, string> = {
  EC: "Ecuador",
  GT: "Guatemala",
  COL: "Colombia",
  RD: "Rep. Dom.",
  CR: "Costa Rica",
};

const COLORS = ["#0033CC", "#3366FF", "#6699FF", "#99CCFF", "#CCE5FF"];

export function CTRByCountryChart({ data }: CTRByCountryChartProps) {
  // Calculate weighted average CTR by country
  const countryStats = data.reduce((acc, row) => {
    if (!acc[row.pais]) {
      acc[row.pais] = { totalClicks: 0, totalImpresiones: 0 };
    }
    acc[row.pais].totalClicks += row.clicks || 0;
    acc[row.pais].totalImpresiones += row.impresiones || 0;
    return acc;
  }, {} as Record<string, { totalClicks: number; totalImpresiones: number }>);

  const chartData = Object.entries(countryStats)
    .map(([pais, stats]) => ({
      pais: COUNTRY_NAMES[pais] || pais,
      ctr: stats.totalImpresiones > 0
        ? (stats.totalClicks / stats.totalImpresiones) * 100
        : 0,
    }))
    .sort((a, b) => b.ctr - a.ctr);

  return (
    <Card className="glass-card border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          CTR% por País (Comparativa)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                type="number"
                tick={{ fontSize: 11 }}
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(v) => `${v.toFixed(1)}%`}
              />
              <YAxis
                type="category"
                dataKey="pais"
                tick={{ fontSize: 11 }}
                stroke="hsl(var(--muted-foreground))"
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [`${value.toFixed(2)}%`, "CTR"]}
              />
              <Bar dataKey="ctr" radius={[0, 4, 4, 0]}>
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
