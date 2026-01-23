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
  Pais: string;
  Canal?: string;
  Tipo_Campana?: string;
  Destino_Funnel?: string;
  Campana?: string;
  CPA?: number;
  CPC?: number;
  Alcance?: number;
  Frecuencia?: number;
  Moneda?: string;
  id?: number;
  createdAt?: string;
  updatedAt?: string;
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
  createdAt?: string;
  updatedAt?: string;
  // Additional lead status fields
  Proceso_de_Cierre?: number;
  Cliente_registrado?: number;
  No_interesado?: number;
  // Client type fields
  Mercaderia_Propia?: number;
  Free_Ecommerce?: number;
  Dropshipping?: number;
  Servicios_Effi?: number;
  Mixto?: number;
}

export interface MetricRow {
  fecha: string;
  fechaDisplay?: string;
  leads: number;
  inversion: number;
  cpl: number;
  ctr: number;
  impresiones?: number;
  clicks?: number;
  pais: string;
  // New fields from updated API
  canal?: string;
  tipoCampana?: string;
  destinoFunnel?: string;
  campana?: string;
  cpa?: number;
  cpc?: number;
  alcance?: number;
  frecuencia?: number;
  moneda?: string;
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
  { 
    comercial: "Alejandro", 
    pais: "EC", 
    contactos: 38, 
    cuentasCerradas: 5, 
    cuentasGestion: 12, 
    cuentasPendiente: 15, 
    cuentasDescartadas: 6, 
    montoTotal: 627.90,
    procesoCierre: 0,
    clienteRegistrado: 0,
    noInteresado: 0,
    mercaderiaPropia: 0,
    freeEcommerce: 0,
    dropshipping: 0,
    serviciosEffi: 0,
    mixto: 0,
  },
];

const formatDate = (dateStr: string): string => {
  try {
    // Handle format "YYYY-MM-DD" (new format, e.g., "2026-01-21")
    if (dateStr.includes('-') && dateStr.length === 10) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const day = parts[2];
        const month = parseInt(parts[1], 10);
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        if (month >= 1 && month <= 12) {
          return `${parseInt(day, 10)} ${months[month - 1]}`;
        }
      }
    }
    
    // Handle format "D/MM/YYYY" or "DD/MM/YYYY" or "DD/MM/YY"
    const parts = dateStr.split('/');
    if (parts.length >= 2) {
      const day = parts[0];
      const month = parseInt(parts[1], 10);
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      if (month >= 1 && month <= 12) {
        return `${day} ${months[month - 1]}`;
      }
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};

const mapPautaResponse = (data: ApiPautaResponse[]): MetricRow[] => {
  return data.map((item) => {
    // Calculate CPL from investment/leads if not provided directly
    const cpl = item.Leads_Total > 0 
      ? item.Inversion_Total / item.Leads_Total 
      : 0;
    
    return {
      fecha: item.Fecha,
      fechaDisplay: formatDate(item.Fecha),
      leads: item.Leads_Total,
      inversion: item.Inversion_Total,
      cpl: cpl,
      ctr: item.CTR_Promedio,
      impresiones: item.Impresiones_Total,
      clicks: item.Clicks_Total,
      pais: item.Pais || "EC",
      // New fields from updated API
      canal: item.Canal,
      tipoCampana: item.Tipo_Campana,
      destinoFunnel: item.Destino_Funnel,
      campana: item.Campana,
      cpa: item.CPA,
      cpc: item.CPC,
      alcance: item.Alcance,
      frecuencia: item.Frecuencia,
      moneda: item.Moneda,
    };
  });
};

const mapCommercialsResponse = (data: ApiCommercialResponse[]): CommercialRow[] => {
  // Some webhook runs may accidentally include a header-like row (e.g. Fecha: "Fecha").
  // We discard those here so they don't pollute aggregations and filters.
  return data
    .filter((item) => {
      const fecha = (item.Fecha ?? "").trim();
      const comercial = (item.Comercial ?? "").trim();
      if (!comercial) return false;
      if (comercial.toLowerCase() === "comercial") return false;
      if (fecha.toLowerCase() === "fecha") return false;
      return true;
    })
    .map((item) => ({
      comercial: item.Comercial || "Sin nombre",
      pais: item.Pais || "EC",
      contactos: item.Contactos ?? 0,
      cuentasCerradas: item.CuentasCerradas ?? 0,
      cuentasGestion: item.CuentasGestion ?? 0,
      cuentasPendiente: item.CuentasPendiente ?? 0,
      cuentasDescartadas: item.CuentasDescartadas ?? 0,
      montoTotal: item.MontoTotal ?? 0,
      // IMPORTANT: keep the raw date string so year/month filters can work (e.g. "21/01/26").
      // Formatting ("21 Ene") drops the year and breaks year-based filters.
      fecha: item.Fecha ? item.Fecha : undefined,
      createdAt: item.createdAt,
      // Additional lead status fields
      procesoCierre: item.Proceso_de_Cierre ?? 0,
      clienteRegistrado: item.Cliente_registrado ?? 0,
      noInteresado: item.No_interesado ?? 0,
      // Client type fields
      mercaderiaPropia: item.Mercaderia_Propia ?? 0,
      freeEcommerce: item.Free_Ecommerce ?? 0,
      dropshipping: item.Dropshipping ?? 0,
      serviciosEffi: item.Servicios_Effi ?? 0,
      mixto: item.Mixto ?? 0,
    }));
};

// 4 hours in milliseconds (4 * 60 * 60 * 1000 = 14400000)
export function useMetrics(refreshInterval = 14400000) {
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
      
      // Handle n8n webhook response structure: {success: true, data: [{json: {...}}, ...]}
      // Extract the actual data from the nested json field
      const extractData = (rawData: unknown): unknown[] => {
        if (Array.isArray(rawData)) {
          // Check if it's n8n format with nested json objects
          if (rawData.length > 0 && rawData[0]?.json) {
            return rawData.map((item: { json: unknown }) => item.json);
          }
          return rawData;
        }
        if (rawData && typeof rawData === 'object') {
          const obj = rawData as Record<string, unknown>;
          // Handle {success: true, data: [...]} format
          if (obj.success && Array.isArray(obj.data)) {
            const dataArray = obj.data as Array<{ json?: unknown }>;
            // Check if nested json objects
            if (dataArray.length > 0 && dataArray[0]?.json) {
              return dataArray.map((item) => item.json);
            }
            return dataArray;
          }
          // Handle {pauta: [...]} or {comerciales: [...]} format
          if (Array.isArray(obj.pauta)) return obj.pauta as unknown[];
          if (Array.isArray(obj.comerciales)) return obj.comerciales as unknown[];
        }
        return [];
      };
      
      const pautaArray = extractData(pautaRawData) as ApiPautaResponse[];
      const commercialsArray = extractData(comercialesRawData) as ApiCommercialResponse[];
      
      console.log("Pauta data extracted:", pautaArray.length, "records");
      console.log("Commercials data extracted:", commercialsArray.length, "records");
      
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
