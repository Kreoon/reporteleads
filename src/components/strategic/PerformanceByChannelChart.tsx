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
import { ChannelLogo } from "@/components/ui/channel-logo";

interface MetricRow {
  canal?: string;
  leads: number;
  inversion: number;
}

interface PerformanceByChannelChartProps {
  data: MetricRow[];
  currency?: string;
}

const CHANNEL_COLORS: Record<string, string> = {
  "Meta Ads": "#0066FF",
  "Google Ads": "#EA4335",
  "TikTok Ads": "#FF0050",
  "YouTube Ads": "#FF0000",
  "Display": "#34A853",
};

export function PerformanceByChannelChart({ data, currency = "USD" }: PerformanceByChannelChartProps) {
  const chartData = useMemo(() => {
    // Group by channel and calculate metrics
    const channelStats = data.reduce((acc, row) => {
      const channel = row.canal || "Sin canal";
      if (!acc[channel]) {
        acc[channel] = { leads: 0, inversion: 0 };
      }
      acc[channel].leads += row.leads;
      acc[channel].inversion += row.inversion;
      return acc;
    }, {} as Record<string, { leads: number; inversion: number }>);

    return Object.entries(channelStats)
      .map(([canal, stats]) => ({
        canal,
        leads: stats.leads,
        inversion: stats.inversion,
        costPerResult: stats.leads > 0 ? stats.inversion / stats.leads : 0,
      }))
      .filter(d => d.leads > 0)
      .sort((a, b) => a.costPerResult - b.costPerResult); // Best (lowest) first
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
            📊 Rendimiento por Canal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            Sin datos de canales
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          📊 C/Res por Canal (Menor = Mejor)
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
                dataKey="canal"
                tick={{ fontSize: 10 }}
                stroke="hsl(var(--muted-foreground))"
                width={90}
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
              <Bar 
                dataKey="costPerResult" 
                radius={[0, 4, 4, 0]}
                name="costPerResult"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={CHANNEL_COLORS[entry.canal] || "#6366f1"} 
                  />
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
        {/* Summary row with channel logos */}
        <div className="mt-3 flex flex-wrap gap-3 justify-center">
          {chartData.slice(0, 4).map((item, i) => (
            <div key={item.canal} className="flex items-center gap-1.5 text-xs">
              <ChannelLogo channel={item.canal} size="sm" />
              <span className={i === 0 ? "text-green-500 font-medium" : "text-muted-foreground"}>
                {symbol}{item.costPerResult.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
