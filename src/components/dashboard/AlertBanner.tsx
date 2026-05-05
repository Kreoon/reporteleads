import { useMemo, useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { CommercialRow } from "@/hooks/useCommercials";

interface MetricRow {
  leads: number;
  inversion: number;
  cpl: number;
}

interface AlertBannerProps {
  pautaData: MetricRow[];
  commercialsData: CommercialRow[];
  historicalCPL?: number;
}

interface AlertItem {
  type: "error" | "warning" | "info";
  message: string;
}

const CPL_UMBRAL_MULTIPLICADOR = 1.2;
const TASA_CIERRE_UMBRAL = 10;
const BRECHA_LEADS_CONTACTOS_UMBRAL = 50;

export function AlertBanner({ pautaData, commercialsData, historicalCPL }: AlertBannerProps) {
  const [expanded, setExpanded] = useState(true);

  const alerts = useMemo((): AlertItem[] => {
    const result: AlertItem[] = [];

    const totalLeads = pautaData.reduce((acc, r) => acc + r.leads, 0);
    const totalInversion = pautaData.reduce((acc, r) => acc + r.inversion, 0);
    const totalRevenue = commercialsData.reduce((acc, r) => acc + r.montoTotal, 0);
    const totalContactos = commercialsData.reduce((acc, r) => acc + r.contactos, 0);
    const totalCerradas = commercialsData.reduce((acc, r) => acc + r.cuentasCerradas, 0);
    const avgCPL = totalLeads > 0 ? totalInversion / totalLeads : 0;

    // CPL elevado vs histórico
    if (historicalCPL && historicalCPL > 0 && avgCPL > historicalCPL * CPL_UMBRAL_MULTIPLICADOR) {
      const pct = Math.round(((avgCPL - historicalCPL) / historicalCPL) * 100);
      result.push({
        type: "error",
        message: `CPL elevado: $${avgCPL.toFixed(2)} (+${pct}% sobre el promedio histórico de $${historicalCPL.toFixed(2)})`,
      });
    }

    // ROAS por debajo de 1
    if (totalInversion > 0 && totalRevenue > 0) {
      const roas = totalRevenue / totalInversion;
      if (roas < 1) {
        result.push({
          type: "error",
          message: `ROAS por debajo de 1x (${roas.toFixed(2)}x) — La pauta no está recuperando la inversión`,
        });
      }
    }

    // Tasa de cierre baja
    if (totalContactos > 0) {
      const tasaCierre = (totalCerradas / totalContactos) * 100;
      if (tasaCierre < TASA_CIERRE_UMBRAL) {
        result.push({
          type: "warning",
          message: `Tasa de cierre baja: ${tasaCierre.toFixed(1)}% (umbral: ${TASA_CIERRE_UMBRAL}%) — Revisar el proceso de ventas`,
        });
      }
    }

    // Brecha alta entre leads y contactos (seguimiento insuficiente)
    if (totalLeads > 0 && totalContactos > 0) {
      const brecha = ((totalLeads - totalContactos) / totalLeads) * 100;
      if (brecha > BRECHA_LEADS_CONTACTOS_UMBRAL) {
        result.push({
          type: "warning",
          message: `${Math.round(brecha)}% de los leads no fueron contactados — ${totalLeads - totalContactos} leads sin seguimiento`,
        });
      }
    }

    return result;
  }, [pautaData, commercialsData, historicalCPL]);

  if (alerts.length === 0) return null;

  const errorCount = alerts.filter(a => a.type === "error").length;
  const warningCount = alerts.filter(a => a.type === "warning").length;

  return (
    <div className="rounded-lg border border-border/50 overflow-hidden mb-4">
      <button
        onClick={() => setExpanded(prev => !prev)}
        className="w-full flex items-center justify-between px-4 py-2 bg-secondary/50 hover:bg-secondary/70 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          <AlertTriangle className="w-4 h-4 text-yellow-500" />
          <span>
            {errorCount > 0 && <span className="text-red-500 mr-1">{errorCount} crít{errorCount === 1 ? "ica" : "icas"}</span>}
            {warningCount > 0 && <span className="text-yellow-500">{warningCount} advertencia{warningCount !== 1 ? "s" : ""}</span>}
          </span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {expanded && (
        <div className="divide-y divide-border/30">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 px-4 py-2.5 text-xs ${
                alert.type === "error"
                  ? "bg-red-500/10 text-red-400"
                  : "bg-yellow-500/10 text-yellow-400"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>{alert.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
