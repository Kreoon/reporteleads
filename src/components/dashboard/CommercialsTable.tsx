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

interface CommercialsTableProps {
  data: CommercialRow[];
}

export function CommercialsTable({ data }: CommercialsTableProps) {
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
                  <TableHead className="text-orange-400 font-medium text-xs text-right py-2">
                    <Tooltip>
                      <TooltipTrigger>No Int.</TooltipTrigger>
                      <TooltipContent className="bg-card border border-border text-foreground">
                        <p>No Interesado</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium text-xs text-right py-2">Monto</TableHead>
                  <TableHead className="text-muted-foreground font-medium text-xs text-right py-2">%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, index) => {
                  const tasaCierre = row.contactos > 0 
                    ? ((row.cuentasCerradas / row.contactos) * 100).toFixed(1) 
                    : "0.0";
                  return (
                    <TableRow key={index} className="border-border/30 hover:bg-secondary/50">
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
                      <TableCell className="text-right text-orange-400 font-semibold text-xs py-1.5">
                        {row.noInteresado ?? 0}
                      </TableCell>
                      <TableCell className="text-right text-foreground text-xs py-1.5">
                        ${(row.montoTotal ?? 0) >= 1000 ? ((row.montoTotal ?? 0) / 1000).toFixed(1) + 'K' : (row.montoTotal ?? 0).toFixed(0)}
                      </TableCell>
                      <TableCell className="text-right text-primary font-semibold text-xs py-1.5">
                        {tasaCierre}%
                      </TableCell>
                    </TableRow>
                  );
                })}
                {data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-4 text-xs">
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
