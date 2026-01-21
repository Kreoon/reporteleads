import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InvestmentChartProps {
  data: Array<{
    fecha: string;
    fechaDisplay?: string;
    inversion: number;
    leads: number;
  }>;
}

// Helper to get display-friendly date
const getDisplayDate = (row: { fecha: string; fechaDisplay?: string }) => 
  row.fechaDisplay || row.fecha;

export function InvestmentChart({ data }: InvestmentChartProps) {
  // Transform data to use display-friendly dates
  const chartData = data.map(row => ({
    ...row,
    displayFecha: getDisplayDate(row),
  }));

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-foreground">
          Inversión vs Leads
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
              <XAxis 
                dataKey="displayFecha" 
                stroke="hsl(215, 20%, 55%)" 
                fontSize={10}
                tickLine={false}
              />
              <YAxis 
                yAxisId="left"
                stroke="hsl(215, 20%, 55%)" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                width={30}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="hsl(215, 20%, 55%)" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                width={25}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(222, 47%, 8%)",
                  border: "1px solid hsl(222, 30%, 18%)",
                  borderRadius: "8px",
                  color: "hsl(210, 40%, 98%)",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "hsl(215, 20%, 55%)" }}
                formatter={(value: number, name: string) => [
                  name === "inversion" ? `$${value.toLocaleString()}` : value,
                  name === "inversion" ? "Inv." : "Leads"
                ]}
              />
              <Legend 
                wrapperStyle={{ color: "hsl(215, 20%, 55%)", fontSize: "10px" }}
                formatter={(value) => value === "inversion" ? "Inv. ($)" : "Leads"}
              />
              <Bar 
                yAxisId="left"
                dataKey="inversion" 
                fill="hsl(199, 89%, 48%)" 
                radius={[3, 3, 0, 0]}
                name="inversion"
              />
              <Bar 
                yAxisId="right"
                dataKey="leads" 
                fill="hsl(217, 91%, 60%)" 
                radius={[3, 3, 0, 0]}
                name="leads"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
