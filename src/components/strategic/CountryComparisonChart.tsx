import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import { useMemo } from "react";
import { CountryFlag } from "@/components/ui/country-flag";

interface MetricRow {
  pais: string;
  leads: number;
  inversion: number;
}

interface CountryComparisonChartProps {
  allRows: MetricRow[];
}

const COUNTRY_COLORS: Record<string, string> = {
  EC: "#6366f1",
  GT: "#06b6d4",
  COL: "#f59e0b",
  RD: "#10b981",
  CR: "#ef4444",
};

const COUNTRY_NAMES: Record<string, string> = {
  EC: "Ecuador",
  GT: "Guatemala",
  COL: "Colombia",
  RD: "Rep. Dom.",
  CR: "Costa Rica",
};

export function CountryComparisonChart({ allRows }: CountryComparisonChartProps) {
  const chartData = useMemo(() => {
    const stats = allRows.reduce((acc, row) => {
      if (!acc[row.pais]) {
        acc[row.pais] = { leads: 0, inversion: 0 };
      }
      acc[row.pais].leads += row.leads;
      acc[row.pais].inversion += row.inversion;
      return acc;
    }, {} as Record<string, { leads: number; inversion: number }>);

    return Object.entries(stats)
      .map(([pais, s]) => ({
        pais,
        nombre: COUNTRY_NAMES[pais] || pais,
        leads: s.leads,
        inversion: Math.round(s.inversion),
        cpr: s.leads > 0 ? parseFloat((s.inversion / s.leads).toFixed(2)) : 0,
      }))
      .filter(d => d.leads > 0)
      .sort((a, b) => b.leads - a.leads);
  }, [allRows]);

  if (chartData.length === 0) {
    return null;
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-card border border-border rounded-lg p-3 text-xs space-y-1">
        <p className="font-semibold text-foreground">{COUNTRY_NAMES[label] || label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name === "leads" ? `Leads: ${p.value.toLocaleString()}` : `Inversión: $${p.value.toLocaleString()}`}
          </p>
        ))}
        {payload[0] && (
          <p className="text-muted-foreground">
            C/Res: ${chartData.find(d => d.pais === label)?.cpr.toFixed(2) || "—"}
          </p>
        )}
      </div>
    );
  };

  return (
    <Card className="glass-card border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base font-semibold">
            🌎 Comparativa Multi-País
          </CardTitle>
          <div className="flex items-center gap-2">
            {chartData.map(d => (
              <div key={d.pais} className="flex items-center gap-1">
                <CountryFlag code={d.pais} size="sm" />
                <span className="text-xs text-muted-foreground">{d.nombre}</span>
              </div>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="pais"
                tick={{ fontSize: 11 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                yAxisId="leads"
                orientation="left"
                tick={{ fontSize: 10 }}
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}
              />
              <YAxis
                yAxisId="inversion"
                orientation="right"
                tick={{ fontSize: 10 }}
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: "11px", color: "hsl(var(--foreground))" }}
                formatter={(v) => v === "leads" ? "Leads" : "Inversión ($)"}
              />
              <Bar yAxisId="leads" dataKey="leads" name="leads" radius={[4, 4, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.pais} fill={COUNTRY_COLORS[entry.pais] || "#6366f1"} />
                ))}
              </Bar>
              <Bar yAxisId="inversion" dataKey="inversion" name="inversion" fill="#94a3b8" opacity={0.6} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Tabla resumen de C/Res por país */}
        <div className="mt-3 grid grid-cols-5 gap-2">
          {chartData.map(d => (
            <div key={d.pais} className="text-center">
              <CountryFlag code={d.pais} size="sm" className="mx-auto mb-1" />
              <p className="text-[10px] text-muted-foreground">{d.nombre}</p>
              <p className="text-xs font-semibold text-foreground">${d.cpr.toFixed(2)}</p>
              <p className="text-[9px] text-muted-foreground">C/Res</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
