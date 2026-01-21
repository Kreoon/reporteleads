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
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-foreground">
          Evolución de Leads
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
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
                fontSize={10}
                tickLine={false}
              />
              <YAxis 
                stroke="hsl(215, 20%, 55%)" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                width={30}
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
              />
              <Area
                type="monotone"
                dataKey="leads"
                stroke="hsl(217, 91%, 60%)"
                strokeWidth={2}
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
