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
} from "recharts";
import { CommercialRow } from "@/hooks/useCommercials";

interface CommercialsChartProps {
  data: CommercialRow[];
}

export function CommercialsChart({ data }: CommercialsChartProps) {
  const chartData = data.map((row) => ({
    name: row.comercial,
    contactos: row.contactos ?? 0,
    cuentasCerradas: row.cuentasCerradas ?? 0,
  }));

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Contactos vs Cuentas Cerradas por Comercial
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--foreground))",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend
              wrapperStyle={{ color: "hsl(var(--foreground))" }}
              formatter={(value) => {
                if (value === "contactos") return "Contactos";
                if (value === "cuentasCerradas") return "Cuentas Cerradas";
                return value;
              }}
            />
            <Bar
              dataKey="contactos"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
              name="contactos"
            />
            <Bar
              dataKey="cuentasCerradas"
              fill="hsl(var(--success))"
              radius={[4, 4, 0, 0]}
              name="cuentasCerradas"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
