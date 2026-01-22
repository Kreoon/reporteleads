import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface MetricRow {
  fecha: string;
  fechaDisplay?: string;
  leads: number;
  inversion: number;
}

interface InvestmentLeadsChartProps {
  data: MetricRow[];
}

export function InvestmentLeadsChart({ data }: InvestmentLeadsChartProps) {
  // Group by date and aggregate
  const chartData = data
    .reduce((acc, row) => {
      const date = row.fechaDisplay || row.fecha;
      const existing = acc.find((d) => d.fecha === date);
      if (existing) {
        existing.leads += row.leads;
        existing.inversion += row.inversion;
      } else {
        acc.push({
          fecha: date,
          leads: row.leads,
          inversion: row.inversion,
        });
      }
      return acc;
    }, [] as { fecha: string; leads: number; inversion: number }[])
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  return (
    <Card className="glass-card border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Inversión vs Leads (Tendencia)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="fecha"
                tick={{ fontSize: 11 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11 }}
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) => [
                  name === "inversion" ? `$${value.toLocaleString()}` : value,
                  name === "inversion" ? "Inversión" : "Leads",
                ]}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="inversion"
                name="Inversión"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="leads"
                name="Leads"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ fill: "#22c55e", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
