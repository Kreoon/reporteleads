import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LeadsChartProps {
  data: Array<{
    fecha: string;
    fechaDisplay?: string;
    leads: number;
  }>;
}

// Helper to get display-friendly date
const getDisplayDate = (row: { fecha: string; fechaDisplay?: string }) => 
  row.fechaDisplay || row.fecha;

export function LeadsChart({ data }: LeadsChartProps) {
  // Transform data to use display-friendly dates
  const chartData = data.map(row => ({
    ...row,
    displayFecha: getDisplayDate(row),
  }));

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Evolución de Leads - Últimos 7 Días
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
              <XAxis 
                dataKey="displayFecha" 
                stroke="hsl(215, 20%, 55%)" 
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
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
              />
              <Area
                type="monotone"
                dataKey="leads"
                stroke="hsl(217, 91%, 60%)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorLeads)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
