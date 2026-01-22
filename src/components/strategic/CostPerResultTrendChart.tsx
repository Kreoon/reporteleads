import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useMemo } from "react";

interface MetricRow {
  fecha: string;
  fechaDisplay?: string;
  leads: number;
  inversion: number;
}

interface CostPerResultTrendChartProps {
  data: MetricRow[];
  currency?: string;
}

export function CostPerResultTrendChart({ data, currency = "USD" }: CostPerResultTrendChartProps) {
  const { chartData, avgCostPerResult } = useMemo(() => {
    // Group by date and calculate daily C/Res
    const dailyStats = data.reduce((acc, row) => {
      const date = row.fechaDisplay || row.fecha;
      if (!acc[date]) {
        acc[date] = { leads: 0, inversion: 0 };
      }
      acc[date].leads += row.leads;
      acc[date].inversion += row.inversion;
      return acc;
    }, {} as Record<string, { leads: number; inversion: number }>);

    const chartData = Object.entries(dailyStats)
      .map(([fecha, stats]) => ({
        fecha,
        costPerResult: stats.leads > 0 ? stats.inversion / stats.leads : 0,
        leads: stats.leads,
        inversion: stats.inversion,
      }))
      .filter(d => d.costPerResult > 0)
      .sort((a, b) => a.fecha.localeCompare(b.fecha));

    // Calculate average C/Res
    const totalInversion = chartData.reduce((sum, d) => sum + d.inversion, 0);
    const totalLeads = chartData.reduce((sum, d) => sum + d.leads, 0);
    const avgCostPerResult = totalLeads > 0 ? totalInversion / totalLeads : 0;

    return { chartData, avgCostPerResult };
  }, [data]);

  const getCurrencySymbol = (curr: string) => {
    const symbols: Record<string, string> = {
      USD: "$", EUR: "€", COP: "$", MXN: "$", GTQ: "Q", DOP: "RD$", CRC: "₡"
    };
    return symbols[curr] || "$";
  };

  const symbol = getCurrencySymbol(currency);

  if (chartData.length === 0) {
    return (
      <Card className="glass-card border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            📉 Tendencia Costo/Resultado por Día
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            Sin datos suficientes
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center justify-between">
          <span>📉 Tendencia C/Res por Día</span>
          <span className="text-sm font-normal text-muted-foreground">
            Promedio: {symbol}{avgCostPerResult.toFixed(2)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="fecha"
                tick={{ fontSize: 10 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(v) => `${symbol}${v.toFixed(0)}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) => {
                  if (name === "costPerResult") return [`${symbol}${value.toFixed(2)}`, "C/Res"];
                  return [value, name];
                }}
                labelFormatter={(label) => `Fecha: ${label}`}
              />
              <ReferenceLine 
                y={avgCostPerResult} 
                stroke="#f97316" 
                strokeDasharray="5 5"
                label={{ 
                  value: "Promedio", 
                  position: "right",
                  fill: "#f97316",
                  fontSize: 10 
                }}
              />
              <Line
                type="monotone"
                dataKey="costPerResult"
                name="costPerResult"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ fill: "#22c55e", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "#16a34a" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
