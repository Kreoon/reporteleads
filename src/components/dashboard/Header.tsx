import { BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import grupoEffiLogo from "@/assets/grupo-effi-logo.jpg";
import { AddPautaModal } from "./AddPautaModal";

export function Header() {
  return (
    <header className="gradient-header border-b border-border/50 sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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

          <div className="flex items-center gap-3 sm:gap-4">
            <AddPautaModal />
            <Link to="/estrategico">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Estratégico
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
