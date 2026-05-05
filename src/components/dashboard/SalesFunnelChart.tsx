import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";
import { CommercialRow } from "@/hooks/useCommercials";

interface MetricRow {
  leads: number;
}

interface SalesFunnelChartProps {
  pautaData: MetricRow[];
  commercialsData: CommercialRow[];
}

const FUNNEL_STEPS = [
  { key: "leads", label: "Leads de Pauta", color: "#6366f1" },
  { key: "contactos", label: "Contactos", color: "#06b6d4" },
  { key: "gestion", label: "En Gestión", color: "#f59e0b" },
  { key: "cerradas", label: "Cuentas Cerradas", color: "#10b981" },
];

export function SalesFunnelChart({ pautaData, commercialsData }: SalesFunnelChartProps) {
  const steps = useMemo(() => {
    const leads = pautaData.reduce((acc, r) => acc + r.leads, 0);
    const contactos = commercialsData.reduce((acc, r) => acc + r.contactos, 0);
    const gestion = commercialsData.reduce((acc, r) => acc + (r.cuentasGestion ?? 0) + (r.procesoCierre ?? 0), 0);
    const cerradas = commercialsData.reduce((acc, r) => acc + r.cuentasCerradas, 0);

    const values = [leads, contactos, gestion, cerradas];

    return FUNNEL_STEPS.map((step, i) => ({
      ...step,
      value: values[i],
      pct: leads > 0 ? Math.round((values[i] / leads) * 100) : 0,
      conversionFromPrev: i === 0
        ? 100
        : values[i - 1] > 0
          ? Math.round((values[i] / values[i - 1]) * 100)
          : 0,
    }));
  }, [pautaData, commercialsData]);

  const maxValue = steps[0]?.value || 1;

  if (maxValue === 0) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-foreground">
            Funnel de Conversión
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
            Sin datos para mostrar el funnel
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-foreground">
          Funnel de Conversión
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex flex-col gap-2 py-1">
          {steps.map((step, i) => {
            const widthPct = maxValue > 0 ? (step.value / maxValue) * 100 : 0;
            return (
              <div key={step.key} className="relative">
                {/* Barra del funnel */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-28 shrink-0 text-right leading-tight">
                    {step.label}
                  </span>
                  <div className="flex-1 bg-secondary rounded h-8 overflow-hidden relative">
                    <div
                      className="h-full rounded transition-all duration-500 flex items-center justify-end pr-2"
                      style={{
                        width: `${widthPct}%`,
                        backgroundColor: step.color,
                        minWidth: step.value > 0 ? "2rem" : "0",
                      }}
                    >
                      {widthPct > 15 && (
                        <span className="text-white text-xs font-bold">{step.value.toLocaleString()}</span>
                      )}
                    </div>
                    {widthPct <= 15 && step.value > 0 && (
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-foreground text-xs font-bold">
                        {step.value.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-semibold w-10 text-right" style={{ color: step.color }}>
                    {step.pct}%
                  </span>
                </div>
                {/* Flecha de conversión entre pasos */}
                {i < steps.length - 1 && (
                  <div className="flex items-center gap-2 mt-0.5 mb-0.5">
                    <span className="w-28 shrink-0" />
                    <div className="flex-1 flex items-center gap-1 pl-2">
                      <span className="text-[9px] text-muted-foreground">
                        ↓ {steps[i + 1].conversionFromPrev}% del paso anterior
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {/* Resumen de conversión total */}
        <div className="mt-3 pt-3 border-t border-border/50 flex justify-between text-xs text-muted-foreground">
          <span>Conversión total pauta → cierre:</span>
          <span className="font-semibold text-foreground">
            {steps[0]?.value > 0
              ? `${Math.round((steps[3]?.value / steps[0]?.value) * 100)}%`
              : "N/A"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
