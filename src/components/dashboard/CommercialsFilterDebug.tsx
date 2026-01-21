import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CommercialsFilterDebugProps {
  totalCountryRecords: number;
  totalAfterFilters: number;
  invalidFechaCount: number;
  minFechaLabel: string;
  maxFechaLabel: string;
  sampleFechas: string[];
}

export function CommercialsFilterDebug({
  totalCountryRecords,
  totalAfterFilters,
  invalidFechaCount,
  minFechaLabel,
  maxFechaLabel,
  sampleFechas,
}: CommercialsFilterDebugProps) {
  return (
    <Card className="glass-card">
      <CardContent className="py-3">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">Registros (país):</span>
            <Badge variant="secondary">{totalCountryRecords}</Badge>
            <span className="text-muted-foreground">Después de filtros:</span>
            <Badge variant="secondary">{totalAfterFilters}</Badge>
            <span className="text-muted-foreground">Fechas inválidas:</span>
            <Badge variant={invalidFechaCount > 0 ? "destructive" : "secondary"}>
              {invalidFechaCount}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">Rango detectado:</span>
            <Badge variant="outline">{minFechaLabel}</Badge>
            <span className="text-muted-foreground">→</span>
            <Badge variant="outline">{maxFechaLabel}</Badge>
          </div>

          {sampleFechas.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-muted-foreground">Ejemplos:</span>
              {sampleFechas.map((f) => (
                <Badge key={f} variant="outline" className="font-mono">
                  {f}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
