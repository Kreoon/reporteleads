import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  lastUpdated: Date | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export function Header({ lastUpdated, isLoading, onRefresh }: HeaderProps) {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center font-bold text-primary-foreground text-lg">
                E
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                  Dashboard EFFI
                </h1>
                <p className="text-sm text-muted-foreground">
                  Métricas de Pauta
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {lastUpdated && (
              <p className="text-xs text-muted-foreground hidden sm:block">
                Última actualización: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="border-border hover:bg-secondary hover:text-foreground"
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
