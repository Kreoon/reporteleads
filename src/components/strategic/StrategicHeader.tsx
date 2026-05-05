import { AlertTriangle, FileDown, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
import grupoEffiLogo from "@/assets/grupo-effi-logo.jpg";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface StrategicHeaderProps {
  cpaAlert: { increase: string; current: number; previous: number } | null;
  frecuenciaAlert?: number | null;
}

export function StrategicHeader({ cpaAlert, frecuenciaAlert }: StrategicHeaderProps) {
  const handleExportCSV = () => {
    // This will be handled by PautaTable component
    const event = new CustomEvent('export-csv');
    window.dispatchEvent(event);
  };

  return (
    <header className="gradient-header border-b border-border/50 sticky top-0 z-40 shadow-lg">
      <div className="px-4 py-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-white hover:bg-white/20" />
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg glow-blue">
                <img 
                  src={grupoEffiLogo} 
                  alt="Grupo Effi Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Dashboard Estratégico de Pauta
                </h1>
                <p className="text-xs text-white/70 font-medium">
                  Grupo Effi · Análisis y métricas de marketing
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <Link to="/">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
                >
                  <BarChart3 className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Dashboard Principal</span>
                </Button>
              </Link>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
              >
                <FileDown className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Exportar CSV</span>
              </Button>
            </div>
          </div>
          
          {cpaAlert && (
            <Alert variant="destructive" className="bg-red-500/20 border-red-500/50 text-white">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                ⚠️ Alerta CPA: aumentó {cpaAlert.increase}% (de ${cpaAlert.previous.toFixed(2)} a ${cpaAlert.current.toFixed(2)})
              </AlertDescription>
            </Alert>
          )}
          {frecuenciaAlert && frecuenciaAlert > 3.5 && (
            <Alert className="bg-orange-500/20 border-orange-500/50 text-white">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                ⚠️ Alerta Frecuencia: {frecuenciaAlert.toFixed(2)}x — El público ha visto el anuncio demasiadas veces. Considera renovar los creativos.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </header>
  );
}
