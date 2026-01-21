import { useState, useEffect, useCallback } from "react";

const API_URL = "https://n8n.grupoeffi.com/webhook/comerciales-metricas";

interface ApiResponse {
  Comercial: string;
  País: string;
  Contactos: number;
  CuentasCerradas: number;
  CuentasGestión: number;
  CuentasPendiente: number;
  CuentasDescartadas: number;
  MontoTotal: number;
}

export interface CommercialRow {
  comercial: string;
  pais: string;
  contactos: number;
  cuentasCerradas: number;
  cuentasGestion: number;
  cuentasPendiente: number;
  cuentasDescartadas: number;
  montoTotal: number;
}

interface CommercialsData {
  rows: CommercialRow[];
}

const FALLBACK_DATA: CommercialRow[] = [
  { comercial: "Alejandro", pais: "EC", contactos: 38, cuentasCerradas: 5, cuentasGestion: 12, cuentasPendiente: 15, cuentasDescartadas: 6, montoTotal: 627.90 },
  { comercial: "María", pais: "EC", contactos: 45, cuentasCerradas: 8, cuentasGestion: 15, cuentasPendiente: 12, cuentasDescartadas: 10, montoTotal: 1250.50 },
  { comercial: "Carlos", pais: "EC", contactos: 32, cuentasCerradas: 4, cuentasGestion: 10, cuentasPendiente: 8, cuentasDescartadas: 10, montoTotal: 480.00 },
];

const mapApiResponse = (data: ApiResponse[]): CommercialRow[] => {
  return data.map((item) => ({
    comercial: item.Comercial || "Sin nombre",
    pais: item.País || "EC",
    contactos: item.Contactos ?? 0,
    cuentasCerradas: item.CuentasCerradas ?? 0,
    cuentasGestion: item.CuentasGestión ?? 0,
    cuentasPendiente: item.CuentasPendiente ?? 0,
    cuentasDescartadas: item.CuentasDescartadas ?? 0,
    montoTotal: item.MontoTotal ?? 0,
  }));
};

export function useCommercials(refreshInterval = 300000) {
  const [data, setData] = useState<CommercialsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialData, setHasInitialData] = useState(false);

  const fetchCommercials = useCallback(async (isManual = false) => {
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

      setData({ rows });
      setError(null);
      setHasInitialData(true);
    } catch (err) {
      console.error("Error fetching commercials:", err);

      if (isManual) {
        setError("No hay conexión con el servidor de comerciales");
      }

      if (!hasInitialData) {
        setData({ rows: FALLBACK_DATA });
      }
    } finally {
      setIsLoading(false);
    }
  }, [hasInitialData]);

  const refetch = useCallback(() => {
    return fetchCommercials(true);
  }, [fetchCommercials]);

  useEffect(() => {
    fetchCommercials(false);

    const interval = setInterval(() => fetchCommercials(false), refreshInterval);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshInterval]);

  return { data, isLoading, error, refetch };
}
