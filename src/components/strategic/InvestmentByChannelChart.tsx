import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface MetricRow {
  canal?: string;
  inversion: number;
}

interface InvestmentByChannelChartProps {
  data: MetricRow[];
}

const COLORS = ["#0033CC", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export function InvestmentByChannelChart({ data }: InvestmentByChannelChartProps) {
  // Aggregate investment by channel
  const channelData = data.reduce((acc, row) => {
    const channel = row.canal || "Desconocido";
    acc[channel] = (acc[channel] || 0) + row.inversion;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(channelData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card className="glass-card border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Distribución de Inversión por Canal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [
                  `$${value.toLocaleString()} (${((value / total) * 100).toFixed(1)}%)`,
                  "Inversión",
                ]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
