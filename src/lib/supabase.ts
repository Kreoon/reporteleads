import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan variables de entorno: VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY son requeridas');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface PautaMetrica {
  id: string;
  fecha: string;
  pais: 'EC' | 'GT' | 'COL' | 'RD' | 'CR';
  canal: string;
  tipo_campana: string | null;
  destino_funnel: string | null;
  campana: string | null;
  moneda: 'USD' | 'COP' | 'GTQ' | 'DOP' | 'CRC';
  leads_total: number;
  impresiones_total: number;
  clicks_total: number;
  inversion_total: number;
  alcance: number;
  frecuencia: number;
  ctr_promedio: number;
  cpa: number;
  cpc: number;
  created_at: string;
  updated_at: string;
}

export interface ComercialMetrica {
  id: string;
  fecha: string;
  comercial: string;
  pais: 'EC' | 'GT' | 'COL' | 'RD' | 'CR';
  contactos: number;
  cuentas_cerradas: number;
  cuentas_gestion: number;
  cuentas_pendiente: number;
  cuentas_descartadas: number;
  proceso_cierre: number;
  cliente_registrado: number;
  no_interesado: number;
  mercaderia_propia: number;
  free_ecommerce: number;
  dropshipping: number;
  servicios_effi: number;
  mixto: number;
  monto_total: number;
  created_at: string;
  updated_at: string;
}
