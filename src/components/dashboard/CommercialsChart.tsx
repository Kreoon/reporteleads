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
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-foreground">
          Contactos vs Cerradas
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-3">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
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
            <Bar
              dataKey="contactos"
              fill="hsl(var(--primary))"
              radius={[3, 3, 0, 0]}
              name="contactos"
            />
            <Bar
              dataKey="cuentasCerradas"
              fill="hsl(var(--success))"
              radius={[3, 3, 0, 0]}
              name="cuentasCerradas"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
