import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MetricsTableProps {
  data: Array<{
    fecha: string;
    fechaDisplay?: string;
    leads: number;
    inversion: number;
    cpl: number;
  }>;
}

// Helper to get display-friendly date
const getDisplayDate = (row: { fecha: string; fechaDisplay?: string }) => 
  row.fechaDisplay || row.fecha;

export function MetricsTable({ data }: MetricsTableProps) {
  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-foreground">
          Resumen Diario
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="overflow-x-auto max-h-[220px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground font-semibold text-xs py-2">Fecha</TableHead>
                <TableHead className="text-muted-foreground font-semibold text-xs text-right py-2">Leads</TableHead>
                <TableHead className="text-muted-foreground font-semibold text-xs text-right py-2">Inv.</TableHead>
                <TableHead className="text-muted-foreground font-semibold text-xs text-right py-2">C/Res</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow 
                  key={index} 
                  className="border-border hover:bg-secondary/50 transition-colors"
                >
                  <TableCell className="font-medium text-foreground text-xs py-1.5">{getDisplayDate(row) || '-'}</TableCell>
                  <TableCell className="text-right text-primary font-semibold text-xs py-1.5">{row.leads ?? 0}</TableCell>
                  <TableCell className="text-right text-foreground text-xs py-1.5">${(row.inversion ?? 0).toLocaleString()}</TableCell>
                  <TableCell className="text-right text-muted-foreground text-xs py-1.5">${(row.cpl ?? 0).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
