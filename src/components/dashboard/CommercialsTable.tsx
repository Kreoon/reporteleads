import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CommercialRow } from "@/hooks/useCommercials";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const TASA_ALTA = 15;
const TASA_MEDIA = 8;

function tasaColor(tasa: number): string {
  if (tasa >= TASA_ALTA) return "text-green-500";
  if (tasa >= TASA_MEDIA) return "text-yellow-500";
  return "text-red-500";
}

const RANKING_ICONS = ["🥇", "🥈", "🥉"];

interface CommercialsTableProps {
  data: CommercialRow[];
}

export function CommercialsTable({ data }: CommercialsTableProps) {
  // Ordenar por tasa de cierre descendente para el ranking
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const tasaA = a.contactos > 0 ? a.cuentasCerradas / a.contactos : 0;
      const tasaB = b.contactos > 0 ? b.cuentasCerradas / b.contactos : 0;
      return tasaB - tasaA;
    });
  }, [data]);

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-foreground">
          Detalle Comerciales
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="overflow-x-auto max-h-[220px] overflow-y-auto">
          <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-medium text-xs py-2 w-6">#</TableHead>
                  <TableHead className="text-muted-foreground font-medium text-xs py-2">Comercial</TableHead>
                  <TableHead className="text-muted-foreground font-medium text-xs text-right py-2">Cont.</TableHead>
                  <TableHead className="text-[hsl(var(--success))] font-medium text-xs text-right py-2">
                    <Tooltip>
                      <TooltipTrigger>Cerr.</TooltipTrigger>
                      <TooltipContent className="bg-card border border-border text-foreground">
                        <p>Cuentas Cerradas</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="text-purple-400 font-medium text-xs text-right py-2">
                    <Tooltip>
                      <TooltipTrigger>P.Cie.</TooltipTrigger>
                      <TooltipContent className="bg-card border border-border text-foreground">
                        <p>Proceso de Cierre</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="text-primary font-medium text-xs text-right py-2">
                    <Tooltip>
                      <TooltipTrigger>Gest.</TooltipTrigger>
                      <TooltipContent className="bg-card border border-border text-foreground">
                        <p>Cuentas en Gestión</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="text-lime-400 font-medium text-xs text-right py-2">
                    <Tooltip>
                      <TooltipTrigger>Cli.Reg.</TooltipTrigger>
                      <TooltipContent className="bg-card border border-border text-foreground">
                        <p>Cliente Registrado</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium text-xs text-right py-2">Monto</TableHead>
                  <TableHead className="text-muted-foreground font-medium text-xs text-right py-2">
                    <Tooltip>
                      <TooltipTrigger>Ticket</TooltipTrigger>
                      <TooltipContent className="bg-card border border-border text-foreground">
                        <p>Monto promedio por cuenta cerrada</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium text-xs text-right py-2">
                    <Tooltip>
                      <TooltipTrigger>% Cierre</TooltipTrigger>
                      <TooltipContent className="bg-card border border-border text-foreground">
                        <p>Tasa de cierre (cerradas / contactos)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((row, index) => {
                  const tasaCierre = row.contactos > 0
                    ? (row.cuentasCerradas / row.contactos) * 100
                    : 0;
                  const ticketPromedio = row.cuentasCerradas > 0
                    ? row.montoTotal / row.cuentasCerradas
                    : 0;
                  return (
                    <TableRow key={index} className="border-border/30 hover:bg-secondary/50">
                      <TableCell className="text-xs py-1.5 w-6">
                        {RANKING_ICONS[index] ?? <span className="text-muted-foreground">{index + 1}</span>}
                      </TableCell>
                      <TableCell className="font-medium text-foreground text-xs py-1.5">
                        {(row.comercial ?? "—").split(' ')[0]}
                      </TableCell>
                      <TableCell className="text-right text-foreground text-xs py-1.5">
                        {row.contactos ?? 0}
                      </TableCell>
                      <TableCell className="text-right text-[hsl(var(--success))] font-semibold text-xs py-1.5">
                        {row.cuentasCerradas ?? 0}
                      </TableCell>
                      <TableCell className="text-right text-purple-400 font-semibold text-xs py-1.5">
                        {row.procesoCierre ?? 0}
                      </TableCell>
                      <TableCell className="text-right text-primary font-semibold text-xs py-1.5">
                        {row.cuentasGestion ?? 0}
                      </TableCell>
                      <TableCell className="text-right text-lime-400 font-semibold text-xs py-1.5">
                        {row.clienteRegistrado ?? 0}
                      </TableCell>
                      <TableCell className="text-right text-foreground text-xs py-1.5">
                        ${(row.montoTotal ?? 0) >= 1000
                          ? ((row.montoTotal ?? 0) / 1000).toFixed(1) + 'K'
                          : (row.montoTotal ?? 0).toFixed(0)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-xs py-1.5">
                        {ticketPromedio > 0
                          ? `$${ticketPromedio >= 1000 ? (ticketPromedio / 1000).toFixed(1) + 'K' : ticketPromedio.toFixed(0)}`
                          : "—"}
                      </TableCell>
                      <TableCell className={`text-right font-semibold text-xs py-1.5 ${tasaColor(tasaCierre)}`}>
                        {tasaCierre.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  );
                })}
                {data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground py-4 text-xs">
                      Sin datos
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}
