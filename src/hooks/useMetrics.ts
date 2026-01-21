import { useState, useEffect, useCallback } from "react";
import { CommercialRow } from "./useCommercials";

const PAUTA_API_URL = "https://n8n.grupoeffi.com/webhook/pauta-metricas";
const COMERCIALES_API_URL = "https://n8n.grupoeffi.com/webhook/comercial-metricas";

interface ApiPautaResponse {
  Fecha: string;
  Leads_Total: number;
  Impresiones_Total: number;
  Clicks_Total: number;
  CTR_Promedio: number;
  Inversion_Total: number;
  CPL_Promedio: number;
  Pais: string;
}

interface ApiCommercialResponse {
  Comercial: string;
  Pais: string;
  Contactos: number;
  CuentasCerradas: number;
  CuentasGestion: number;
  CuentasPendiente: number;
  CuentasDescartadas: number;
  MontoTotal: number;
  Fecha?: string; // Optional date field
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
  commercials: CommercialRow[];
  todayLeads: number;
  todayInversion: number;
  avgCPL: number;
  avgCTR: number;
}

const FALLBACK_PAUTA: MetricRow[] = [
  { fecha: "15 Ene", leads: 78, inversion: 3200, cpl: 41.03, ctr: 2.45, pais: "EC" },
  { fecha: "16 Ene", leads: 92, inversion: 3850, cpl: 41.85, ctr: 2.78, pais: "EC" },
  { fecha: "17 Ene", leads: 65, inversion: 2900, cpl: 44.62, ctr: 2.12, pais: "EC" },
];

const FALLBACK_COMMERCIALS: CommercialRow[] = [
  { comercial: "Alejandro", pais: "EC", contactos: 38, cuentasCerradas: 5, cuentasGestion: 12, cuentasPendiente: 15, cuentasDescartadas: 6, montoTotal: 627.90 },
];

const formatDate = (dateStr: string): string => {
  try {
    const [day, month] = dateStr.split('/');
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${day} ${months[parseInt(month, 10) - 1]}`;
  } catch {
    return dateStr;
  }
};

const mapPautaResponse = (data: ApiPautaResponse[]): MetricRow[] => {
  return data.map((item) => ({
    fecha: formatDate(item.Fecha),
    leads: item.Leads_Total,
    inversion: item.Inversion_Total,
    cpl: item.CPL_Promedio,
    ctr: item.CTR_Promedio,
    impresiones: item.Impresiones_Total,
    clicks: item.Clicks_Total,
    pais: item.Pais || "EC",
  }));
};

const mapCommercialsResponse = (data: ApiCommercialResponse[]): CommercialRow[] => {
  return data.map((item) => ({
    comercial: item.Comercial || "Sin nombre",
    pais: item.Pais || "EC",
    contactos: item.Contactos ?? 0,
    cuentasCerradas: item.CuentasCerradas ?? 0,
    cuentasGestion: item.CuentasGestion ?? 0,
    cuentasPendiente: item.CuentasPendiente ?? 0,
    cuentasDescartadas: item.CuentasDescartadas ?? 0,
    montoTotal: item.MontoTotal ?? 0,
    fecha: item.Fecha ? formatDate(item.Fecha) : undefined,
  }));
};

export function useMetrics(refreshInterval = 300000) {
  const [data, setData] = useState<MetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [hasInitialData, setHasInitialData] = useState(false);

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Fetch both endpoints simultaneously
      const [pautaResponse, comercialesResponse] = await Promise.all([
        fetch(PAUTA_API_URL, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }),
        fetch(COMERCIALES_API_URL, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }),
      ]);
      
      if (!pautaResponse.ok) {
        throw new Error(`Error pauta ${pautaResponse.status}: ${pautaResponse.statusText}`);
      }
      if (!comercialesResponse.ok) {
        throw new Error(`Error comerciales ${comercialesResponse.status}: ${comercialesResponse.statusText}`);
      }
      
      const pautaRawData = await pautaResponse.json();
      const comercialesRawData = await comercialesResponse.json();
      
      // Handle different response structures (array or object with array)
      const pautaArray = Array.isArray(pautaRawData) 
        ? pautaRawData 
        : (Array.isArray(pautaRawData.pauta) ? pautaRawData.pauta : []);
      const commercialsArray = Array.isArray(comercialesRawData) 
        ? comercialesRawData 
        : (Array.isArray(comercialesRawData.comerciales) ? comercialesRawData.comerciales : []);
      
      const rows = mapPautaResponse(pautaArray);
      const commercials = mapCommercialsResponse(commercialsArray);
      
      const todayData = rows[rows.length - 1] || rows[0];
      const avgCPL = rows.length > 0 ? rows.reduce((acc, row) => acc + row.cpl, 0) / rows.length : 0;
      const avgCTR = rows.length > 0 ? rows.reduce((acc, row) => acc + row.ctr, 0) / rows.length : 0;
      
      setData({
        rows,
        commercials,
        todayLeads: todayData?.leads || 0,
        todayInversion: todayData?.inversion || 0,
        avgCPL,
        avgCTR,
      });
      setLastUpdated(new Date());
      setHasInitialData(true);
    } catch (err) {
      console.error("Error fetching metrics:", err);
      
      if (!hasInitialData) {
        setData({
          rows: FALLBACK_PAUTA,
          commercials: FALLBACK_COMMERCIALS,
          todayLeads: FALLBACK_PAUTA[FALLBACK_PAUTA.length - 1].leads,
          todayInversion: FALLBACK_PAUTA[FALLBACK_PAUTA.length - 1].inversion,
          avgCPL: FALLBACK_PAUTA.reduce((acc, row) => acc + row.cpl, 0) / FALLBACK_PAUTA.length,
          avgCTR: FALLBACK_PAUTA.reduce((acc, row) => acc + row.ctr, 0) / FALLBACK_PAUTA.length,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [hasInitialData]);

  const refetch = useCallback(() => {
    return fetchMetrics();
  }, [fetchMetrics]);

  useEffect(() => {
    fetchMetrics();
    
    const interval = setInterval(() => fetchMetrics(), refreshInterval);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshInterval]);

  return { data, isLoading, lastUpdated, refetch };
}
