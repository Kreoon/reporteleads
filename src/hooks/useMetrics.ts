import { useState, useEffect, useCallback } from "react";

// Configuración de la API - Reemplazar con tu URL de n8n
const API_URL = "https://n8n.tudominio.com/webhook/pauta-metricas";

interface ApiResponse {
  Fecha: string;
  Leads_Total: number;
  Impresiones_Total: number;
  Clicks_Total: number;
  CTR_Promedio: string;
  Inversion_Total: number;
  CPL_Promedio: string;
}

interface MetricRow {
  fecha: string;
  leads: number;
  inversion: number;
  cpl: number;
  ctr: number;
  impresiones?: number;
  clicks?: number;
}

interface MetricsData {
  rows: MetricRow[];
  todayLeads: number;
  todayInversion: number;
  avgCPL: number;
  avgCTR: number;
}

// Datos estáticos de respaldo
const FALLBACK_METRICS: MetricRow[] = [
  { fecha: "15 Ene", leads: 78, inversion: 3200, cpl: 41.03, ctr: 2.45 },
  { fecha: "16 Ene", leads: 92, inversion: 3850, cpl: 41.85, ctr: 2.78 },
  { fecha: "17 Ene", leads: 65, inversion: 2900, cpl: 44.62, ctr: 2.12 },
  { fecha: "18 Ene", leads: 104, inversion: 4200, cpl: 40.38, ctr: 3.05 },
  { fecha: "19 Ene", leads: 88, inversion: 3600, cpl: 40.91, ctr: 2.67 },
  { fecha: "20 Ene", leads: 115, inversion: 4500, cpl: 39.13, ctr: 3.22 },
  { fecha: "21 Ene", leads: 98, inversion: 3950, cpl: 40.31, ctr: 2.89 },
];

// Función para formatear fecha de API (21/01/26) a formato legible (21 Ene)
const formatDate = (dateStr: string): string => {
  try {
    const [day, month] = dateStr.split('/');
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${day} ${months[parseInt(month, 10) - 1]}`;
  } catch {
    return dateStr;
  }
};

// Función para mapear respuesta de API al formato interno
const mapApiResponse = (data: ApiResponse | ApiResponse[]): MetricRow[] => {
  const dataArray = Array.isArray(data) ? data : [data];
  
  return dataArray.map((item) => ({
    fecha: formatDate(item.Fecha),
    leads: item.Leads_Total,
    inversion: item.Inversion_Total,
    cpl: parseFloat(item.CPL_Promedio) || 0,
    ctr: parseFloat(item.CTR_Promedio) || 0,
    impresiones: item.Impresiones_Total,
    clicks: item.Clicks_Total,
  }));
};

export function useMetrics(refreshInterval = 300000) { // 5 minutos
  const [data, setData] = useState<MetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const rawData = await response.json();
      const rows = mapApiResponse(rawData);
      
      // Calcular métricas
      const todayData = rows[rows.length - 1] || rows[0];
      const avgCPL = rows.reduce((acc, row) => acc + row.cpl, 0) / rows.length;
      const avgCTR = rows.reduce((acc, row) => acc + row.ctr, 0) / rows.length;
      
      setData({
        rows,
        todayLeads: todayData?.leads || 0,
        todayInversion: todayData?.inversion || 0,
        avgCPL,
        avgCTR,
      });
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error("Error fetching metrics:", err);
      setError("No hay conexión con el servidor de datos");
      
      // Usar datos de respaldo si no hay datos previos
      if (!data) {
        const rows = FALLBACK_METRICS;
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
      }
    } finally {
      setIsLoading(false);
    }
  }, [data]);

  useEffect(() => {
    fetchMetrics();
    
    const interval = setInterval(fetchMetrics, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchMetrics, refreshInterval]);

  return { data, isLoading, error, lastUpdated, refetch: fetchMetrics };
}
