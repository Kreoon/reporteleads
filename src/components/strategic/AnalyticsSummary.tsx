import { Trophy, AlertCircle, MapPin, Zap, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CountryFlag, FLAGS } from "@/components/ui/country-flag";
import { ChannelLogo } from "@/components/ui/channel-logo";

interface MetricRow {
  fecha: string;
  leads: number;
  inversion: number;
  ctr: number;
  pais: string;
  cpa?: number;
  canal?: string;
  campana?: string;
}

interface AnalyticsSummaryProps {
  data: MetricRow[];
}

export function AnalyticsSummary({ data }: AnalyticsSummaryProps) {
  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Sin datos para mostrar análisis
      </div>
    );
  }

  // Best campaign by CTR
  const bestCTRRow = data.reduce((best, row) => 
    row.ctr > (best?.ctr || 0) ? row : best
  , data[0]);
  
  // Worst CPA - filter valid CPA values first
  const rowsWithCPA = data.filter(row => row.cpa && row.cpa > 0);
  const worstCPARow = rowsWithCPA.length > 0
    ? rowsWithCPA.reduce((worst, row) => 
        (row.cpa || 0) > (worst?.cpa || 0) ? row : worst
      , rowsWithCPA[0])
    : null;
  
  // Country with most leads
  const leadsByCountry = data.reduce((acc, row) => {
    acc[row.pais] = (acc[row.pais] || 0) + row.leads;
    return acc;
  }, {} as Record<string, number>);
  
  const topCountryEntry = Object.entries(leadsByCountry)
    .sort((a, b) => b[1] - a[1])[0];
  
  // Most profitable channel
  const channelStats = data.reduce((acc, row) => {
    const channel = row.canal || "Desconocido";
    if (!acc[channel]) {
      acc[channel] = { leads: 0, inversion: 0 };
    }
    acc[channel].leads += row.leads;
    acc[channel].inversion += row.inversion;
    return acc;
  }, {} as Record<string, { leads: number; inversion: number }>);
  
  const mostProfitableChannel = Object.entries(channelStats)
    .map(([channel, stats]) => ({
      channel,
      efficiency: stats.inversion > 0 ? stats.leads / stats.inversion : 0
    }))
    .sort((a, b) => b.efficiency - a.efficiency)[0];
  
  // General efficiency
  const totalLeads = data.reduce((sum, row) => sum + row.leads, 0);
  const totalInversion = data.reduce((sum, row) => sum + row.inversion, 0);
  const generalEfficiency = totalInversion > 0 ? (totalLeads / totalInversion) * 1000 : 0;

  const cards = [
    {
      title: "Mejor Campaña por CTR",
      value: bestCTRRow?.campana || bestCTRRow?.canal || "N/A",
      detail: bestCTRRow ? `${bestCTRRow.ctr.toFixed(2)}% CTR` : "",
      icon: Trophy,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "Peor Costo/Resultado",
      value: worstCPARow?.campana || worstCPARow?.pais || "N/A",
      detail: worstCPARow?.cpa ? `$${worstCPARow.cpa.toFixed(2)}` : "",
      icon: AlertCircle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      title: "País con Más Resultados",
      value: topCountryEntry?.[0] || "N/A",
      detail: topCountryEntry ? `${topCountryEntry[1].toLocaleString()} resultados` : "",
      icon: MapPin,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      isCountry: true,
    },
    {
      title: "Canal Más Rentable",
      value: mostProfitableChannel?.channel || "N/A",
      detail: mostProfitableChannel ? `${(mostProfitableChannel.efficiency * 1000).toFixed(1)} res/$K` : "",
      icon: Zap,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      isChannel: true,
    },
    {
      title: "Eficiencia General",
      value: `${generalEfficiency.toFixed(2)}`,
      detail: "Resultados por $1,000",
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((card, index) => (
        <Card key={index} className="glass-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-1">{card.title}</p>
            <div className="text-sm font-bold text-foreground truncate flex items-center gap-1">
              {card.isCountry && card.value !== "N/A" && FLAGS[card.value] ? (
                <CountryFlag code={card.value} showCode size="sm" />
              ) : card.isChannel && card.value !== "N/A" ? (
                <ChannelLogo channel={card.value} size="sm" />
              ) : (
                card.value
              )}
            </div>
            <p className="text-xs text-muted-foreground">{card.detail}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
