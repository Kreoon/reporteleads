import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const WEBHOOK_URL = "https://n8n.grupoeffi.com/webhook/agregar-pauta";

const COUNTRIES = [
  { code: "EC", name: "Ecuador" },
  { code: "GT", name: "Guatemala" },
  { code: "COL", name: "Colombia" },
  { code: "RD", name: "Rep. Dominicana" },
  { code: "CR", name: "Costa Rica" },
];

interface AddPautaModalProps {
  onSuccess: () => void;
}

export function AddPautaModal({ onSuccess }: AddPautaModalProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [fecha, setFecha] = useState<Date | undefined>(undefined);
  const [pais, setPais] = useState("");
  const [canal, setCanal] = useState("");
  const [leads, setLeads] = useState("");
  const [impresiones, setImpresiones] = useState("");
  const [clicks, setClicks] = useState("");
  const [inversion, setInversion] = useState("");

  // Auto-calculated fields
  const [ctr, setCtr] = useState("0.00");
  const [cpl, setCpl] = useState("0.00");

  // Calculate CTR and CPL automatically
  useEffect(() => {
    const clicksNum = parseFloat(clicks) || 0;
    const impresionesNum = parseFloat(impresiones) || 0;
    const leadsNum = parseFloat(leads) || 0;
    const inversionNum = parseFloat(inversion) || 0;

    const calculatedCtr = impresionesNum > 0 ? (clicksNum / impresionesNum) * 100 : 0;
    const calculatedCpl = leadsNum > 0 ? inversionNum / leadsNum : 0;

    setCtr(calculatedCtr.toFixed(2));
    setCpl(calculatedCpl.toFixed(2));
  }, [clicks, impresiones, leads, inversion]);

  const resetForm = () => {
    setFecha(undefined);
    setPais("");
    setCanal("");
    setLeads("");
    setImpresiones("");
    setClicks("");
    setInversion("");
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fecha) newErrors.fecha = "La fecha es obligatoria";
    if (!pais) newErrors.pais = "El país es obligatorio";
    if (!canal.trim()) newErrors.canal = "El canal es obligatorio";
    if (!leads || parseFloat(leads) <= 0) newErrors.leads = "Debe ser mayor a 0";
    if (!impresiones || parseFloat(impresiones) <= 0) newErrors.impresiones = "Debe ser mayor a 0";
    if (!clicks || parseFloat(clicks) <= 0) newErrors.clicks = "Debe ser mayor a 0";
    if (!inversion || parseFloat(inversion) <= 0) newErrors.inversion = "Debe ser mayor a 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error("Por favor completa todos los campos correctamente");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        Fecha: fecha ? format(fecha, "yyyy-MM-dd") : "",
        Pais: pais,
        Canal: canal.trim(),
        Leads_Total: parseInt(leads, 10),
        Impresiones_Total: parseInt(impresiones, 10),
        Clicks_Total: parseInt(clicks, 10),
        CTR_Promedio: parseFloat(ctr),
        Inversion_Total: parseFloat(inversion),
        CPL_Promedio: parseFloat(cpl),
      };

      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      toast.success("Pauta agregada exitosamente");
      resetForm();
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error("Error submitting pauta:", error);
      toast.error("Error al enviar los datos. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) resetForm();
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg rounded-full px-5 py-3 flex items-center gap-2 md:static md:rounded-md md:shadow-none"
      >
        <Plus className="h-5 w-5" />
        <span className="hidden md:inline">Agregar Pauta</span>
      </Button>

      {/* Modal */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[500px] border-2 border-primary bg-background">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-primary flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Agregar Nueva Pauta
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Ingresa los datos de la campaña publicitaria
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            {/* Fecha */}
            <div className="grid gap-2">
              <Label htmlFor="fecha" className="text-foreground font-medium">
                Fecha *
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !fecha && "text-muted-foreground",
                      errors.fecha && "border-destructive"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fecha ? format(fecha, "PPP", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[100] bg-background" align="start">
                  <Calendar
                    mode="single"
                    selected={fecha}
                    onSelect={setFecha}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {errors.fecha && <span className="text-xs text-destructive">{errors.fecha}</span>}
            </div>

            {/* País */}
            <div className="grid gap-2">
              <Label htmlFor="pais" className="text-foreground font-medium">
                País *
              </Label>
              <Select value={pais} onValueChange={setPais}>
                <SelectTrigger className={cn(errors.pais && "border-destructive")}>
                  <SelectValue placeholder="Seleccionar país" />
                </SelectTrigger>
                <SelectContent className="z-[100] bg-background">
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.pais && <span className="text-xs text-destructive">{errors.pais}</span>}
            </div>

            {/* Canal */}
            <div className="grid gap-2">
              <Label htmlFor="canal" className="text-foreground font-medium">
                Canal *
              </Label>
              <Input
                id="canal"
                placeholder="Ej: Meta Ads, Google Ads"
                value={canal}
                onChange={(e) => setCanal(e.target.value)}
                className={cn(errors.canal && "border-destructive")}
              />
              {errors.canal && <span className="text-xs text-destructive">{errors.canal}</span>}
            </div>

            {/* Leads e Impresiones en row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="leads" className="text-foreground font-medium">
                  Leads *
                </Label>
                <Input
                  id="leads"
                  type="number"
                  min="1"
                  placeholder="0"
                  value={leads}
                  onChange={(e) => setLeads(e.target.value)}
                  className={cn(errors.leads && "border-destructive")}
                />
                {errors.leads && <span className="text-xs text-destructive">{errors.leads}</span>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="impresiones" className="text-foreground font-medium">
                  Impresiones *
                </Label>
                <Input
                  id="impresiones"
                  type="number"
                  min="1"
                  placeholder="0"
                  value={impresiones}
                  onChange={(e) => setImpresiones(e.target.value)}
                  className={cn(errors.impresiones && "border-destructive")}
                />
                {errors.impresiones && <span className="text-xs text-destructive">{errors.impresiones}</span>}
              </div>
            </div>

            {/* Clicks e Inversión en row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="clicks" className="text-foreground font-medium">
                  Clicks *
                </Label>
                <Input
                  id="clicks"
                  type="number"
                  min="1"
                  placeholder="0"
                  value={clicks}
                  onChange={(e) => setClicks(e.target.value)}
                  className={cn(errors.clicks && "border-destructive")}
                />
                {errors.clicks && <span className="text-xs text-destructive">{errors.clicks}</span>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="inversion" className="text-foreground font-medium">
                  Inversión ($) *
                </Label>
                <Input
                  id="inversion"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={inversion}
                  onChange={(e) => setInversion(e.target.value)}
                  className={cn(errors.inversion && "border-destructive")}
                />
                {errors.inversion && <span className="text-xs text-destructive">{errors.inversion}</span>}
              </div>
            </div>

            {/* Campos calculados automáticamente */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
              <div className="grid gap-2">
                <Label className="text-muted-foreground text-sm">
                  CTR (%) <span className="text-xs">(auto)</span>
                </Label>
                <Input
                  value={ctr}
                  readOnly
                  disabled
                  className="bg-muted/50 text-foreground font-medium"
                />
              </div>

              <div className="grid gap-2">
                <Label className="text-muted-foreground text-sm">
                  CPL ($) <span className="text-xs">(auto)</span>
                </Label>
                <Input
                  value={cpl}
                  readOnly
                  disabled
                  className="bg-muted/50 text-foreground font-medium"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSubmitting ? "Enviando..." : "Enviar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
