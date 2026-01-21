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
    leads: number;
    inversion: number;
    cpl: number;
  }>;
}

export function MetricsTable({ data }: MetricsTableProps) {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Resumen Diario
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground font-semibold">Fecha</TableHead>
                <TableHead className="text-muted-foreground font-semibold text-right">Leads</TableHead>
                <TableHead className="text-muted-foreground font-semibold text-right">Inversión</TableHead>
                <TableHead className="text-muted-foreground font-semibold text-right">CPL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow 
                  key={index} 
                  className="border-border hover:bg-secondary/50 transition-colors"
                >
                  <TableCell className="font-medium text-foreground">{row.fecha || '-'}</TableCell>
                  <TableCell className="text-right text-primary font-semibold">{row.leads ?? 0}</TableCell>
                  <TableCell className="text-right text-foreground">${(row.inversion ?? 0).toLocaleString()}</TableCell>
                  <TableCell className="text-right text-muted-foreground">${(row.cpl ?? 0).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
