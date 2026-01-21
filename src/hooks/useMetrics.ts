import { useState, useEffect, useCallback } from "react";

// Configuración de la API
const API_URL = "https://n8n.grupoeffi.com/webhook/pauta-metricas";

interface ApiResponse {
  id: number;
  Fecha: string;
  Leads_Total: number;
  Impresiones_Total: number;
  Clicks_Total: number;
  CTR_Promedio: number;
  Inversion_Total: number;
  CPL_Promedio: number;
  País: string;
  createdAt: string;
}

interface MetricRow {
  fecha: string;
  leads: number;
  inversion: number;
  cpl: number;
  ctr: number;
  impresiones?: number;
  clicks?: number;
  pais: string;
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
  { fecha: "15 Ene", leads: 78, inversion: 3200, cpl: 41.03, ctr: 2.45, pais: "EC" },
  { fecha: "16 Ene", leads: 92, inversion: 3850, cpl: 41.85, ctr: 2.78, pais: "EC" },
  { fecha: "17 Ene", leads: 65, inversion: 2900, cpl: 44.62, ctr: 2.12, pais: "EC" },
  { fecha: "18 Ene", leads: 104, inversion: 4200, cpl: 40.38, ctr: 3.05, pais: "EC" },
  { fecha: "19 Ene", leads: 88, inversion: 3600, cpl: 40.91, ctr: 2.67, pais: "EC" },
  { fecha: "20 Ene", leads: 115, inversion: 4500, cpl: 39.13, ctr: 3.22, pais: "EC" },
  { fecha: "21 Ene", leads: 98, inversion: 3950, cpl: 40.31, ctr: 2.89, pais: "EC" },
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
const mapApiResponse = (data: ApiResponse[]): MetricRow[] => {
  return data.map((item) => ({
    fecha: formatDate(item.Fecha),
    leads: item.Leads_Total,
    inversion: item.Inversion_Total,
    cpl: item.CPL_Promedio,
    ctr: item.CTR_Promedio,
    impresiones: item.Impresiones_Total,
    clicks: item.Clicks_Total,
    pais: item.País || "EC",
  }));
};

export function useMetrics(refreshInterval = 300000) { // 5 minutos
  const [data, setData] = useState<MetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [hasInitialData, setHasInitialData] = useState(false);

  // Función unificada de fetch - isManual indica si fue clic del usuario
  const fetchMetrics = useCallback(async (isManual = false) => {
    setIsLoading(true);
    if (isManual) {
      setError(null);
    }
    
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
      const dataArray = Array.isArray(rawData) ? rawData : [rawData];
      const rows = mapApiResponse(dataArray);
      
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
      setHasInitialData(true);
    } catch (err) {
      console.error("Error fetching metrics:", err);
      
      if (isManual) {
        setError("No hay conexión con el servidor de datos");
      }
      
      // Usar datos de respaldo solo si no hay datos previos
      if (!hasInitialData) {
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
  }, [hasInitialData]);

  // Función para el botón de actualizar (manual)
  const refetch = useCallback(() => {
    return fetchMetrics(true);
  }, [fetchMetrics]);

  useEffect(() => {
    fetchMetrics(false);
    
    const interval = setInterval(() => fetchMetrics(false), refreshInterval);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshInterval]);

  return { data, isLoading, error, lastUpdated, refetch };
}
