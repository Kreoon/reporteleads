import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";

interface PautaRow {
  fecha: string;
  fechaDisplay?: string;
  leads: number;
}

interface CommercialRow {
  contactos: number;
}

interface LeadsPautaVsCommercialsChartProps {
  pautaData: PautaRow[];
  commercialsData: CommercialRow[];
}

export function LeadsPautaVsCommercialsChart({ 
  pautaData, 
  commercialsData 
}: LeadsPautaVsCommercialsChartProps) {
  // Calculate totals for comparison
  const chartData = useMemo(() => {
    const totalLeadsPauta = pautaData.reduce((sum, row) => sum + row.leads, 0);
    const totalContactosComerciales = commercialsData.reduce((sum, row) => sum + row.contactos, 0);
    
    // Calculate gap percentage
    const gap = totalLeadsPauta > 0 
      ? ((totalContactosComerciales - totalLeadsPauta) / totalLeadsPauta) * 100 
      : 0;
    
    return {
      data: [
        {
          name: "Comparación",
          leadsPauta: totalLeadsPauta,
          contactosComerciales: totalContactosComerciales,
        }
      ],
      totalLeadsPauta,
      totalContactosComerciales,
      gap,
    };
  }, [pautaData, commercialsData]);

  const gapColor = chartData.gap >= 0 ? "text-green-400" : "text-red-400";
  const gapSign = chartData.gap >= 0 ? "+" : "";

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-foreground flex items-center justify-between">
          <span>Resultados Pauta vs Contactos Comerciales</span>
          {chartData.totalLeadsPauta > 0 && (
            <span className={`text-xs font-normal ${gapColor}`}>
              Brecha: {gapSign}{chartData.gap.toFixed(1)}%
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData.data} 
              margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
              <XAxis 
                type="number"
                stroke="hsl(215, 20%, 55%)" 
                fontSize={10}
                tickLine={false}
              />
              <YAxis 
                type="category"
                dataKey="name"
                stroke="hsl(215, 20%, 55%)" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                hide
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
                  value.toLocaleString(),
                  name === "leadsPauta" ? "Resultados (Pauta)" : "Contactos (Comerciales)"
                ]}
              />
              <Legend 
                wrapperStyle={{ color: "hsl(215, 20%, 55%)", fontSize: "10px" }}
                formatter={(value) => value === "leadsPauta" ? "Resultados (Pauta)" : "Contactos (Comerciales)"}
              />
              <Bar 
                dataKey="leadsPauta" 
                fill="hsl(199, 89%, 48%)" 
                radius={[0, 4, 4, 0]}
                name="leadsPauta"
                barSize={40}
              />
              <Bar 
                dataKey="contactosComerciales" 
                fill="hsl(142, 76%, 36%)" 
                radius={[0, 4, 4, 0]}
                name="contactosComerciales"
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Summary below chart */}
        <div className="flex justify-center gap-8 mt-2 text-xs">
          <div className="text-center">
            <div className="text-cyan-400 font-bold text-lg">{chartData.totalLeadsPauta.toLocaleString()}</div>
            <div className="text-muted-foreground">Resultados Pauta</div>
          </div>
          <div className="text-center">
            <div className="text-green-400 font-bold text-lg">{chartData.totalContactosComerciales.toLocaleString()}</div>
            <div className="text-muted-foreground">Contactos Comerciales</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
