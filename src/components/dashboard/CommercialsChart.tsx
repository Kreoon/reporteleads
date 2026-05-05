import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CommercialRow } from "@/hooks/useCommercials";

const TASA_ALTA = 15;
const TASA_MEDIA = 8;

function getTasaColor(tasa: number): string {
  if (tasa >= TASA_ALTA) return "#10b981"; // verde
  if (tasa >= TASA_MEDIA) return "#f59e0b"; // amarillo
  return "#ef4444"; // rojo
}

interface CommercialsChartProps {
  data: CommercialRow[];
}

export function CommercialsChart({ data }: CommercialsChartProps) {
  const [showEfficiency, setShowEfficiency] = useState(false);

  const volumenData = data.map((row) => ({
    name: row.comercial,
    contactos: row.contactos ?? 0,
    cuentasCerradas: row.cuentasCerradas ?? 0,
  }));

  const eficienciaData = data
    .map((row) => {
      const tasaCierre = row.contactos > 0 ? (row.cuentasCerradas / row.contactos) * 100 : 0;
      const ticketPromedio = row.cuentasCerradas > 0 ? row.montoTotal / row.cuentasCerradas : 0;
      return {
        name: row.comercial,
        tasaCierre: parseFloat(tasaCierre.toFixed(1)),
        ticketPromedio: parseFloat(ticketPromedio.toFixed(0)),
      };
    })
    .sort((a, b) => b.tasaCierre - a.tasaCierre);

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-foreground">
            {showEfficiency ? "Eficiencia por Comercial" : "Contactos vs Cerradas"}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Label htmlFor="efficiency-toggle" className="text-xs text-muted-foreground">
              Eficiencia
            </Label>
            <Switch
              id="efficiency-toggle"
              checked={showEfficiency}
              onCheckedChange={setShowEfficiency}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        {showEfficiency ? (
          <>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={eficienciaData}
                layout="vertical"
                margin={{ top: 5, right: 40, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  type="number"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                    fontSize: "12px",
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === "tasaCierre") return [`${value}%`, "Tasa de cierre"];
                    if (name === "ticketPromedio") return [`$${value.toLocaleString()}`, "Ticket promedio"];
                    return [value, name];
                  }}
                />
                <Bar dataKey="tasaCierre" radius={[0, 4, 4, 0]} name="tasaCierre">
                  {eficienciaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getTasaColor(entry.tasaCierre)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-2 flex items-center gap-4 justify-center text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                {`≥${TASA_ALTA}% bueno`}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-500 shrink-0" />
                {`≥${TASA_MEDIA}% medio`}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                {`<${TASA_MEDIA}% bajo`}
              </span>
            </div>
          </>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={volumenData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Legend
                wrapperStyle={{ color: "hsl(var(--foreground))", fontSize: "10px" }}
                formatter={(value) => {
                  if (value === "contactos") return "Cont.";
                  if (value === "cuentasCerradas") return "Cerr.";
                  return value;
                }}
              />
              <Bar dataKey="contactos" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} name="contactos" />
              <Bar dataKey="cuentasCerradas" fill="hsl(var(--success))" radius={[3, 3, 0, 0]} name="cuentasCerradas" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
