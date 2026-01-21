import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InvestmentChartProps {
  data: Array<{
    fecha: string;
    inversion: number;
    leads: number;
  }>;
}

export function InvestmentChart({ data }: InvestmentChartProps) {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Inversión vs Leads por Día
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
              <XAxis 
                dataKey="fecha" 
                stroke="hsl(215, 20%, 55%)" 
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                yAxisId="left"
                stroke="hsl(215, 20%, 55%)" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="hsl(215, 20%, 55%)" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(222, 47%, 8%)",
                  border: "1px solid hsl(222, 30%, 18%)",
                  borderRadius: "8px",
                  color: "hsl(210, 40%, 98%)",
                }}
                labelStyle={{ color: "hsl(215, 20%, 55%)" }}
                formatter={(value: number, name: string) => [
                  name === "inversion" ? `$${value.toLocaleString()}` : value,
                  name === "inversion" ? "Inversión" : "Leads"
                ]}
              />
              <Legend 
                wrapperStyle={{ color: "hsl(215, 20%, 55%)" }}
                formatter={(value) => value === "inversion" ? "Inversión ($)" : "Leads"}
              />
              <Bar 
                yAxisId="left"
                dataKey="inversion" 
                fill="hsl(199, 89%, 48%)" 
                radius={[4, 4, 0, 0]}
                name="inversion"
              />
              <Bar 
                yAxisId="right"
                dataKey="leads" 
                fill="hsl(217, 91%, 60%)" 
                radius={[4, 4, 0, 0]}
                name="leads"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
