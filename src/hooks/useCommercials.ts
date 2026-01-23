// Types for commercial data - used by useMetrics hook
export interface CommercialRow {
  comercial: string;
  pais: string;
  contactos: number;
  cuentasCerradas: number;
  cuentasGestion: number;
  cuentasPendiente: number;
  cuentasDescartadas: number;
  montoTotal: number;
  fecha?: string; // Optional date field for filtering
  createdAt?: string; // Fallback timestamp from API (ISO)
  // Additional lead status fields
  procesoCierre: number;
  clienteRegistrado: number;
  noInteresado: number;
  // Client type fields
  mercaderiaPropia: number;
  freeEcommerce: number;
  dropshipping: number;
  serviciosEffi: number;
  mixto: number;
}
