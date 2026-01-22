import { useEffect } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CountryFlag } from "@/components/ui/country-flag";
import { ChannelLogo } from "@/components/ui/channel-logo";

interface MetricRow {
  fecha: string;
  fechaDisplay?: string;
  leads: number;
  inversion: number;
  cpl: number;
  ctr: number;
  impresiones?: number;
  clicks?: number;
  pais: string;
  canal?: string;
  tipoCampana?: string;
  destinoFunnel?: string;
  campana?: string;
  cpa?: number;
  cpc?: number;
  alcance?: number;
  frecuencia?: number;
  moneda?: string;
}

interface PautaTableProps {
  data: MetricRow[];
  onRefresh: () => void;
}

export function PautaTable({ data, onRefresh }: PautaTableProps) {
  const exportCSV = () => {
    const headers = [
      "Fecha",
      "País",
      "Canal",
      "Tipo Campaña",
      "Destino Funnel",
      "Campaña",
      "Leads",
      "Impresiones",
      "Clicks",
      "CTR%",
      "Inversión",
      "Costo/Res",
      "CPC",
      "Alcance",
      "Frecuencia",
      "Moneda",
    ];

    const rows = data.map((row) => [
      row.fechaDisplay || row.fecha,
      row.pais,
      row.canal || "",
      row.tipoCampana || "",
      row.destinoFunnel || "",
      row.campana || "",
      row.leads,
      row.impresiones || 0,
      row.clicks || 0,
      row.ctr.toFixed(2),
      row.inversion.toFixed(2),
      row.cpa?.toFixed(2) || "",
      row.cpc?.toFixed(2) || "",
      row.alcance || "",
      row.frecuencia || "",
      row.moneda || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `pauta-report-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  // Listen for export event from header
  useEffect(() => {
    const handleExport = () => exportCSV();
    window.addEventListener("export-csv", handleExport);
    return () => window.removeEventListener("export-csv", handleExport);
  }, [data]);

  return (
    <Card className="glass-card border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Detalle de Pauta ({data.length} registros)
          </CardTitle>
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="w-full">
          <div className="min-w-[1100px]">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Fecha</TableHead>
                  <TableHead className="font-semibold">País</TableHead>
                  <TableHead className="font-semibold">Canal</TableHead>
                  <TableHead className="font-semibold">Tipo</TableHead>
                  <TableHead className="font-semibold">Destino</TableHead>
                  <TableHead className="font-semibold">Campaña</TableHead>
                  <TableHead className="font-semibold text-right">Leads</TableHead>
                  <TableHead className="font-semibold text-right">Impresiones</TableHead>
                  <TableHead className="font-semibold text-right">Clicks</TableHead>
                  <TableHead className="font-semibold text-right">CTR%</TableHead>
                  <TableHead className="font-semibold text-right">Inversión</TableHead>
                  <TableHead className="font-semibold text-right">C/Res</TableHead>
                  <TableHead className="font-semibold text-right">CPC</TableHead>
                  <TableHead className="font-semibold text-right">Alcance</TableHead>
                  <TableHead className="font-semibold text-right">Frec.</TableHead>
                  <TableHead className="font-semibold">Moneda</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow key={index} className="hover:bg-muted/30">
                    <TableCell className="font-medium">
                      {row.fechaDisplay || row.fecha}
                    </TableCell>
                    <TableCell>
                      <CountryFlag code={row.pais} size="sm" />
                    </TableCell>
                    <TableCell>
                      {row.canal ? <ChannelLogo channel={row.canal} size="sm" /> : "-"}
                    </TableCell>
                    <TableCell className="capitalize">{row.tipoCampana || "-"}</TableCell>
                    <TableCell className="capitalize">{row.destinoFunnel || "-"}</TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      {row.campana || "-"}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      {row.leads.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.impresiones?.toLocaleString() || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.clicks?.toLocaleString() || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.ctr.toFixed(2)}%
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      ${row.inversion.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.cpa ? `$${row.cpa.toFixed(2)}` : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.cpc ? `$${row.cpc.toFixed(2)}` : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.alcance?.toLocaleString() || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.frecuencia?.toFixed(1) || "-"}
                    </TableCell>
                    <TableCell>{row.moneda || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
