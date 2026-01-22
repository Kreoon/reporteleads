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
  tipoCampana?: string;
  leads: number;
  inversion: number;
}

interface PerformanceByCampaignTypeChartProps {
  data: MetricRow[];
  currency?: string;
}

const TYPE_COLORS: Record<string, string> = {
  leads: "#22c55e",
  conversiones: "#3b82f6",
  ventas: "#8b5cf6",
  trafico: "#f97316",
  alcance: "#06b6d4",
  reconocimiento: "#ec4899",
  engagement: "#eab308",
  video_views: "#ef4444",
  retargeting: "#14b8a6",
  remarketing: "#a855f7",
};

const TYPE_LABELS: Record<string, string> = {
  leads: "Leads",
  conversiones: "Conversiones",
  ventas: "Ventas",
  trafico: "Tráfico",
  alcance: "Alcance",
  reconocimiento: "Reconocimiento",
  engagement: "Engagement",
  video_views: "Video Views",
  retargeting: "Retargeting",
  remarketing: "Remarketing",
};

export function PerformanceByCampaignTypeChart({ data, currency = "USD" }: PerformanceByCampaignTypeChartProps) {
  const chartData = useMemo(() => {
    // Group by campaign type
    const typeStats = data.reduce((acc, row) => {
      const type = row.tipoCampana || "otros";
      if (!acc[type]) {
        acc[type] = { leads: 0, inversion: 0 };
      }
      acc[type].leads += row.leads;
      acc[type].inversion += row.inversion;
      return acc;
    }, {} as Record<string, { leads: number; inversion: number }>);

    return Object.entries(typeStats)
      .map(([tipo, stats]) => ({
        tipo,
        tipoLabel: TYPE_LABELS[tipo] || tipo.charAt(0).toUpperCase() + tipo.slice(1),
        leads: stats.leads,
        inversion: stats.inversion,
        costPerResult: stats.leads > 0 ? stats.inversion / stats.leads : 0,
      }))
      .filter(d => d.leads > 0)
      .sort((a, b) => a.costPerResult - b.costPerResult); // Best first
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
            🎯 Rendimiento por Tipo de Campaña
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            Sin datos de tipos de campaña
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          🎯 C/Res por Tipo de Campaña
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="tipoLabel"
                tick={{ fontSize: 10 }}
                stroke="hsl(var(--muted-foreground))"
                angle={-25}
                textAnchor="end"
                height={60}
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
                  if (name === "leads") return [value, "Resultados"];
                  return [value, name];
                }}
              />
              <Bar 
                dataKey="costPerResult" 
                radius={[4, 4, 0, 0]}
                name="costPerResult"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={TYPE_COLORS[entry.tipo] || "#6366f1"} 
                  />
                ))}
                <LabelList 
                  dataKey="costPerResult" 
                  position="top" 
                  formatter={(v: number) => `${symbol}${v.toFixed(0)}`}
                  style={{ fontSize: 9, fill: "hsl(var(--foreground))" }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Best performer highlight */}
        {chartData.length > 0 && (
          <div className="mt-2 text-center text-xs text-muted-foreground">
            <span className="text-green-500 font-medium">
              Mejor: {chartData[0].tipoLabel}
            </span>
            {" "}con C/Res de {symbol}{chartData[0].costPerResult.toFixed(2)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
