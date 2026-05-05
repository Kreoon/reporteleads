import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase, PautaMetrica, ComercialMetrica } from '@/lib/supabase';
import { MetricRow } from '@/hooks/useMetrics';
import { CommercialRow } from '@/hooks/useCommercials';

const formatDate = (dateStr: string): string => {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const day = parseInt(parts[2], 10);
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

const mapPauta = (item: PautaMetrica): MetricRow => ({
  fecha: item.fecha,
  fechaDisplay: formatDate(item.fecha),
  leads: item.leads_total,
  inversion: item.inversion_total,
  cpl: item.leads_total > 0 ? item.inversion_total / item.leads_total : 0,
  ctr: item.ctr_promedio,
  impresiones: item.impresiones_total,
  clicks: item.clicks_total,
  pais: item.pais,
  canal: item.canal,
  tipoCampana: item.tipo_campana ?? undefined,
  destinoFunnel: item.destino_funnel ?? undefined,
  campana: item.campana ?? undefined,
  cpa: item.cpa,
  cpc: item.cpc,
  alcance: item.alcance,
  frecuencia: item.frecuencia,
  moneda: item.moneda,
});

const mapComercial = (item: ComercialMetrica): CommercialRow => ({
  comercial: item.comercial,
  pais: item.pais,
  contactos: item.contactos,
  cuentasCerradas: item.cuentas_cerradas,
  cuentasGestion: item.cuentas_gestion,
  cuentasPendiente: item.cuentas_pendiente,
  cuentasDescartadas: item.cuentas_descartadas,
  montoTotal: item.monto_total,
  fecha: item.fecha,
  createdAt: item.created_at,
  procesoCierre: item.proceso_cierre,
  clienteRegistrado: item.cliente_registrado,
  noInteresado: item.no_interesado,
  mercaderiaPropia: item.mercaderia_propia,
  freeEcommerce: item.free_ecommerce,
  dropshipping: item.dropshipping,
  serviciosEffi: item.servicios_effi,
  mixto: item.mixto,
});

interface MetricsData {
  rows: MetricRow[];
  commercials: CommercialRow[];
  todayLeads: number;
  todayInversion: number;
  avgCPL: number;
  avgCTR: number;
}

export function useSupabaseMetrics() {
  const queryClient = useQueryClient();

  const { data: pautaRaw, isLoading: pautaLoading } = useQuery({
    queryKey: ['pauta'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pauta_metricas')
        .select('*')
        .order('fecha', { ascending: false });
      if (error) throw error;
      return data as PautaMetrica[];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const { data: comercialesRaw, isLoading: comercialesLoading } = useQuery({
    queryKey: ['comerciales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comercial_metricas')
        .select('*')
        .order('fecha', { ascending: false });
      if (error) throw error;
      return data as ComercialMetrica[];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // Realtime: invalida cache cuando hay cambios en las tablas
  useEffect(() => {
    const pautaChannel = supabase
      .channel('pauta-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pauta_metricas' }, () => {
        queryClient.invalidateQueries({ queryKey: ['pauta'] });
      })
      .subscribe();

    const comercialChannel = supabase
      .channel('comercial-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comercial_metricas' }, () => {
        queryClient.invalidateQueries({ queryKey: ['comerciales'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(pautaChannel);
      supabase.removeChannel(comercialChannel);
    };
  }, [queryClient]);

  const rows = (pautaRaw || []).map(mapPauta);
  const commercials = (comercialesRaw || []).map(mapComercial);
  const isLoading = pautaLoading || comercialesLoading;

  const todayData = rows[0];
  const avgCPL = rows.length > 0 ? rows.reduce((acc, r) => acc + r.cpl, 0) / rows.length : 0;
  const avgCTR = rows.length > 0 ? rows.reduce((acc, r) => acc + r.ctr, 0) / rows.length : 0;

  const data: MetricsData = {
    rows,
    commercials,
    todayLeads: todayData?.leads || 0,
    todayInversion: todayData?.inversion || 0,
    avgCPL,
    avgCTR,
  };

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ['pauta'] });
    queryClient.invalidateQueries({ queryKey: ['comerciales'] });
  };

  return {
    data: isLoading ? null : data,
    isLoading,
    lastUpdated: new Date(),
    refetch,
  };
}
