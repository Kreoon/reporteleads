import { useState, useEffect, useCallback } from "react";

interface MetricRow {
  fecha: string;
  leads: number;
  inversion: number;
  cpl: number;
  ctr: number;
}

interface MetricsData {
  rows: MetricRow[];
  todayLeads: number;
  todayInversion: number;
  avgCPL: number;
  avgCTR: number;
}

// Datos estáticos de ejemplo - Reemplazar con llamada API de n8n después
const STATIC_METRICS: MetricRow[] = [
  { fecha: "15 Ene", leads: 78, inversion: 3200, cpl: 41.03, ctr: 2.45 },
  { fecha: "16 Ene", leads: 92, inversion: 3850, cpl: 41.85, ctr: 2.78 },
  { fecha: "17 Ene", leads: 65, inversion: 2900, cpl: 44.62, ctr: 2.12 },
  { fecha: "18 Ene", leads: 104, inversion: 4200, cpl: 40.38, ctr: 3.05 },
  { fecha: "19 Ene", leads: 88, inversion: 3600, cpl: 40.91, ctr: 2.67 },
  { fecha: "20 Ene", leads: 115, inversion: 4500, cpl: 39.13, ctr: 3.22 },
  { fecha: "21 Ene", leads: 98, inversion: 3950, cpl: 40.31, ctr: 2.89 },
];

export function useMetrics(refreshInterval = 300000) { // 5 minutes default
  const [data, setData] = useState<MetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Replace with actual n8n API call
      // const response = await fetch('YOUR_N8N_WEBHOOK_URL/pauta_metricas');
      // const rawData = await response.json();
      
      // Usando datos estáticos de ejemplo
      await new Promise(resolve => setTimeout(resolve, 300)); // Simular carga breve
      const rows = STATIC_METRICS;
      
      const todayData = rows[rows.length - 1];
      const avgCPL = rows.reduce((acc, row) => acc + row.cpl, 0) / rows.length;
      const avgCTR = rows.reduce((acc, row) => acc + row.ctr, 0) / rows.length;
      
      setData({
        rows,
        todayLeads: todayData.leads,
        todayInversion: todayData.inversion,
        avgCPL,
        avgCTR,
      });
      setLastUpdated(new Date());
    } catch (err) {
      setError("Error al cargar las métricas");
      console.error("Error fetching metrics:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    
    const interval = setInterval(fetchMetrics, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchMetrics, refreshInterval]);

  return { data, isLoading, error, lastUpdated, refetch: fetchMetrics };
}
