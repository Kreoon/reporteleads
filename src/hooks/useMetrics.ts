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

// Mock data for demonstration - Replace with actual n8n API call
const generateMockData = (): MetricRow[] => {
  const today = new Date();
  const data: MetricRow[] = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const leads = Math.floor(Math.random() * 100) + 50;
    const inversion = Math.floor(Math.random() * 5000) + 2000;
    const cpl = inversion / leads;
    const ctr = Math.random() * 3 + 1;
    
    data.push({
      fecha: date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      leads,
      inversion,
      cpl,
      ctr,
    });
  }
  
  return data;
};

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
      
      // Using mock data for now
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
      const rows = generateMockData();
      
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
