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

interface CommercialsTableProps {
  data: CommercialRow[];
}

export function CommercialsTable({ data }: CommercialsTableProps) {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Tabla de Comerciales
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-muted-foreground font-medium">Comercial</TableHead>
                <TableHead className="text-muted-foreground font-medium text-right">Contactos</TableHead>
                <TableHead className="text-muted-foreground font-medium text-right">
                  <span className="text-[hsl(var(--success))]">Cerradas</span>
                </TableHead>
                <TableHead className="text-muted-foreground font-medium text-right">
                  <span className="text-primary">En Gestión</span>
                </TableHead>
                <TableHead className="text-muted-foreground font-medium text-right">
                  <span className="text-[hsl(var(--warning))]">Pendiente</span>
                </TableHead>
                <TableHead className="text-muted-foreground font-medium text-right">
                  <span className="text-destructive">Descartadas</span>
                </TableHead>
                <TableHead className="text-muted-foreground font-medium text-right">Monto Total</TableHead>
                <TableHead className="text-muted-foreground font-medium text-right">Tasa Cierre</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => {
                const tasaCierre = row.contactos > 0 
                  ? ((row.cuentasCerradas / row.contactos) * 100).toFixed(1) 
                  : "0.0";
                return (
                  <TableRow key={index} className="border-border/30 hover:bg-secondary/50">
                    <TableCell className="font-medium text-foreground">
                      {row.comercial ?? "—"}
                    </TableCell>
                    <TableCell className="text-right text-foreground">
                      {(row.contactos ?? 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-[hsl(var(--success))] font-semibold">
                      {(row.cuentasCerradas ?? 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-primary font-semibold">
                      {(row.cuentasGestion ?? 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-[hsl(var(--warning))] font-semibold">
                      {(row.cuentasPendiente ?? 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-destructive font-semibold">
                      {(row.cuentasDescartadas ?? 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-foreground font-semibold">
                      ${(row.montoTotal ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right text-primary font-semibold">
                      {tasaCierre}%
                    </TableCell>
                  </TableRow>
                );
              })}
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No hay datos de comerciales para este país
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
