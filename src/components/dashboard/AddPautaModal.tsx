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

const CHANNELS = [
  "Meta Ads",
  "Google Ads",
  "TikTok Ads",
  "YouTube Ads",
  "Display",
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
  const [campana, setCampana] = useState("");
  const [leads, setLeads] = useState("");
  const [impresiones, setImpresiones] = useState("");
  const [clicks, setClicks] = useState("");
  const [inversion, setInversion] = useState("");
  const [alcance, setAlcance] = useState("");
  const [frecuencia, setFrecuencia] = useState("");
  const [conversiones, setConversiones] = useState("");

  // Auto-calculated fields
  const [ctr, setCtr] = useState("0.00");
  const [cpl, setCpl] = useState("0.00");
  const [cpc, setCpc] = useState("0.00");
  const [cpa, setCpa] = useState("0.00");

  // Calculate metrics automatically
  useEffect(() => {
    const clicksNum = parseFloat(clicks) || 0;
    const impresionesNum = parseFloat(impresiones) || 0;
    const leadsNum = parseFloat(leads) || 0;
    const inversionNum = parseFloat(inversion) || 0;
    const conversionesNum = parseFloat(conversiones) || 0;

    const calculatedCtr = impresionesNum > 0 ? (clicksNum / impresionesNum) * 100 : 0;
    const calculatedCpl = leadsNum > 0 ? inversionNum / leadsNum : 0;
    const calculatedCpc = clicksNum > 0 ? inversionNum / clicksNum : 0;
    const calculatedCpa = conversionesNum > 0 ? inversionNum / conversionesNum : 0;

    setCtr(calculatedCtr.toFixed(2));
    setCpl(calculatedCpl.toFixed(2));
    setCpc(calculatedCpc.toFixed(2));
    setCpa(calculatedCpa.toFixed(2));
  }, [clicks, impresiones, leads, inversion, conversiones]);

  const resetForm = () => {
    setFecha(undefined);
    setPais("");
    setCanal("");
    setCampana("");
    setLeads("");
    setImpresiones("");
    setClicks("");
    setInversion("");
    setAlcance("");
    setFrecuencia("");
    setConversiones("");
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fecha) newErrors.fecha = "La fecha es obligatoria";
    if (!pais) newErrors.pais = "El país es obligatorio";
    if (!canal) newErrors.canal = "El canal es obligatorio";
    if (!campana.trim()) newErrors.campana = "El nombre de campaña es obligatorio";
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
        Canal: canal,
        Campana: campana.trim(),
        Leads_Total: parseInt(leads, 10),
        Impresiones_Total: parseInt(impresiones, 10),
        Clicks_Total: parseInt(clicks, 10),
        CTR_Promedio: parseFloat(ctr),
        Inversion_Total: parseFloat(inversion),
        CPL_Promedio: parseFloat(cpl),
        CPC: parseFloat(cpc),
        Alcance: alcance ? parseInt(alcance, 10) : 0,
        Frecuencia: frecuencia ? parseFloat(frecuencia) : 0,
        Conversiones: conversiones ? parseInt(conversiones, 10) : 0,
        CPA: parseFloat(cpa),
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
        <DialogContent className="sm:max-w-[560px] border-2 border-primary bg-background max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-primary flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Agregar Nueva Pauta
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Ingresa los datos de la campaña publicitaria
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-3 max-h-[55vh] overflow-y-auto pr-2">
            {/* Fecha y País en row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-foreground font-medium text-sm">Fecha *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "w-full justify-start text-left font-normal h-9",
                        !fecha && "text-muted-foreground",
                        errors.fecha && "border-destructive"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fecha ? format(fecha, "dd/MM/yyyy", { locale: es }) : "Seleccionar"}
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

              <div className="grid gap-1.5">
                <Label className="text-foreground font-medium text-sm">País *</Label>
                <Select value={pais} onValueChange={setPais}>
                  <SelectTrigger className={cn("h-9", errors.pais && "border-destructive")}>
                    <SelectValue placeholder="Seleccionar" />
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
            </div>

            {/* Canal y Campaña en row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-foreground font-medium text-sm">Canal *</Label>
                <Select value={canal} onValueChange={setCanal}>
                  <SelectTrigger className={cn("h-9", errors.canal && "border-destructive")}>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent className="z-[100] bg-background">
                    {CHANNELS.map((channel) => (
                      <SelectItem key={channel} value={channel}>
                        {channel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.canal && <span className="text-xs text-destructive">{errors.canal}</span>}
              </div>

              <div className="grid gap-1.5">
                <Label className="text-foreground font-medium text-sm">Campaña *</Label>
                <Input
                  placeholder="Nombre de campaña"
                  value={campana}
                  onChange={(e) => setCampana(e.target.value)}
                  className={cn("h-9", errors.campana && "border-destructive")}
                />
                {errors.campana && <span className="text-xs text-destructive">{errors.campana}</span>}
              </div>
            </div>

            {/* Métricas principales */}
            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-foreground font-medium text-sm">Leads *</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="0"
                  value={leads}
                  onChange={(e) => setLeads(e.target.value)}
                  className={cn("h-9", errors.leads && "border-destructive")}
                />
                {errors.leads && <span className="text-xs text-destructive">{errors.leads}</span>}
              </div>

              <div className="grid gap-1.5">
                <Label className="text-foreground font-medium text-sm">Impresiones *</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="0"
                  value={impresiones}
                  onChange={(e) => setImpresiones(e.target.value)}
                  className={cn("h-9", errors.impresiones && "border-destructive")}
                />
                {errors.impresiones && <span className="text-xs text-destructive">{errors.impresiones}</span>}
              </div>

              <div className="grid gap-1.5">
                <Label className="text-foreground font-medium text-sm">Clicks *</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="0"
                  value={clicks}
                  onChange={(e) => setClicks(e.target.value)}
                  className={cn("h-9", errors.clicks && "border-destructive")}
                />
                {errors.clicks && <span className="text-xs text-destructive">{errors.clicks}</span>}
              </div>
            </div>

            {/* Inversión y Conversiones */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-foreground font-medium text-sm">Inversión ($) *</Label>
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={inversion}
                  onChange={(e) => setInversion(e.target.value)}
                  className={cn("h-9", errors.inversion && "border-destructive")}
                />
                {errors.inversion && <span className="text-xs text-destructive">{errors.inversion}</span>}
              </div>

              <div className="grid gap-1.5">
                <Label className="text-foreground font-medium text-sm">Conversiones</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={conversiones}
                  onChange={(e) => setConversiones(e.target.value)}
                  className="h-9"
                />
              </div>
            </div>

            {/* Alcance y Frecuencia */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-foreground font-medium text-sm">Alcance</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={alcance}
                  onChange={(e) => setAlcance(e.target.value)}
                  className="h-9"
                />
              </div>

              <div className="grid gap-1.5">
                <Label className="text-foreground font-medium text-sm">Frecuencia</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={frecuencia}
                  onChange={(e) => setFrecuencia(e.target.value)}
                  className="h-9"
                />
              </div>
            </div>

            {/* Campos calculados automáticamente */}
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-border">
              <div className="grid gap-1">
                <Label className="text-muted-foreground text-xs">CTR %</Label>
                <Input
                  value={ctr}
                  readOnly
                  disabled
                  className="h-8 text-sm bg-muted/50 text-foreground font-medium"
                />
              </div>
              <div className="grid gap-1">
                <Label className="text-muted-foreground text-xs">CPL $</Label>
                <Input
                  value={cpl}
                  readOnly
                  disabled
                  className="h-8 text-sm bg-muted/50 text-foreground font-medium"
                />
              </div>
              <div className="grid gap-1">
                <Label className="text-muted-foreground text-xs">CPC $</Label>
                <Input
                  value={cpc}
                  readOnly
                  disabled
                  className="h-8 text-sm bg-muted/50 text-foreground font-medium"
                />
              </div>
              <div className="grid gap-1">
                <Label className="text-muted-foreground text-xs">CPA $</Label>
                <Input
                  value={cpa}
                  readOnly
                  disabled
                  className="h-8 text-sm bg-muted/50 text-foreground font-medium"
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
