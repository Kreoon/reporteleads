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
  LabelList,
} from "recharts";
import { useMemo } from "react";

interface MetricRow {
  destinoFunnel?: string;
  leads: number;
  inversion: number;
}

interface PerformanceByFunnelChartProps {
  data: MetricRow[];
  currency?: string;
}

const FUNNEL_COLORS = [
  "#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b",
  "#ef4444", "#ec4899", "#14b8a6",
];

export function PerformanceByFunnelChart({ data, currency = "USD" }: PerformanceByFunnelChartProps) {
  const chartData = useMemo(() => {
    const funnelStats = data.reduce((acc, row) => {
      const destino = row.destinoFunnel || "Sin segmentar";
      if (!acc[destino]) {
        acc[destino] = { leads: 0, inversion: 0 };
      }
      acc[destino].leads += row.leads;
      acc[destino].inversion += row.inversion;
      return acc;
    }, {} as Record<string, { leads: number; inversion: number }>);

    return Object.entries(funnelStats)
      .map(([destino, stats]) => ({
        destino,
        leads: stats.leads,
        inversion: stats.inversion,
        costPerResult: stats.leads > 0 ? stats.inversion / stats.leads : 0,
      }))
      .filter(d => d.leads > 0)
      .sort((a, b) => a.costPerResult - b.costPerResult);
  }, [data]);

  const symbol = currency === "COP" ? "$" : currency === "GTQ" ? "Q" : currency === "DOP" ? "RD$" : currency === "CRC" ? "₡" : "$";

  if (chartData.length === 0) {
    return (
      <Card className="glass-card border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            🎯 C/Res por Destino de Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
            Sin datos de destino de funnel
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          🎯 C/Res por Destino de Funnel (Menor = Mejor)
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
                tickFormatter={(v) => `${symbol}${v.toFixed(0)}`}
              />
              <YAxis
                type="category"
                dataKey="destino"
                tick={{ fontSize: 10 }}
                stroke="hsl(var(--muted-foreground))"
                width={110}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) => {
                  if (name === "costPerResult") return [`${symbol}${value.toFixed(2)}`, "C/Res"];
                  if (name === "leads") return [value, "Resultados"];
                  if (name === "inversion") return [`${symbol}${value.toLocaleString()}`, "Inversión"];
                  return [value, name];
                }}
              />
              <Bar dataKey="costPerResult" radius={[0, 4, 4, 0]} name="costPerResult">
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={FUNNEL_COLORS[index % FUNNEL_COLORS.length]} />
                ))}
                <LabelList
                  dataKey="costPerResult"
                  position="right"
                  formatter={(v: number) => `${symbol}${v.toFixed(2)}`}
                  style={{ fontSize: 10, fill: "hsl(var(--foreground))" }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 justify-center">
          {chartData.map((item, i) => (
            <div key={item.destino} className="flex items-center gap-1.5 text-xs">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: FUNNEL_COLORS[i % FUNNEL_COLORS.length] }}
              />
              <span className={i === 0 ? "text-green-500 font-medium" : "text-muted-foreground"}>
                {item.destino}: {symbol}{item.costPerResult.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
