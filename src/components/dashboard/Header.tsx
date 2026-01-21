import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import grupoEffiLogo from "@/assets/grupo-effi-logo.jpg";

interface HeaderProps {
  lastUpdated: Date | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export function Header({ lastUpdated, isLoading, onRefresh }: HeaderProps) {
  return (
    <header className="gradient-header border-b border-border/50 sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg glow-blue">
                <img 
                  src={grupoEffiLogo} 
                  alt="Grupo Effi Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Dashboard Captación de Leads
                </h1>
                <p className="text-sm text-white/70 font-medium">
                  Grupo Effi · Métricas en tiempo real
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {lastUpdated && (
              <div className="hidden sm:flex flex-col items-end">
                <p className="text-xs text-white/60">Última actualización</p>
                <p className="text-sm font-medium text-white">
                  {lastUpdated.toLocaleTimeString()}
                </p>
              </div>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
