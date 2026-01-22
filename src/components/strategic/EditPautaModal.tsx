import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface MetricRow {
  fecha: string;
  leads: number;
  inversion: number;
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

interface EditPautaModalProps {
  row: MetricRow | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditPautaModal({ row, open, onClose, onSuccess }: EditPautaModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<MetricRow>>({});

  useEffect(() => {
    if (row) {
      setFormData({ ...row });
    }
  }, [row]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Here you would send the update to your webhook
      // For now, we'll simulate success
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast.success("Registro actualizado correctamente");
      onSuccess();
    } catch (error) {
      toast.error("Error al actualizar el registro");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof MetricRow, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!row) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Registro de Pauta</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label>Fecha</Label>
            <Input value={formData.fecha || ""} disabled />
          </div>
          <div className="space-y-2">
            <Label>País</Label>
            <Input value={formData.pais || ""} disabled />
          </div>
          <div className="space-y-2">
            <Label>Canal</Label>
            <Input
              value={formData.canal || ""}
              onChange={(e) => updateField("canal", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Campaña</Label>
            <Input
              value={formData.campana || ""}
              onChange={(e) => updateField("campana", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Leads</Label>
            <Input
              type="number"
              value={formData.leads || 0}
              onChange={(e) => updateField("leads", parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label>Inversión</Label>
            <Input
              type="number"
              value={formData.inversion || 0}
              onChange={(e) => updateField("inversion", parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label>Impresiones</Label>
            <Input
              type="number"
              value={formData.impresiones || 0}
              onChange={(e) => updateField("impresiones", parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label>Clicks</Label>
            <Input
              type="number"
              value={formData.clicks || 0}
              onChange={(e) => updateField("clicks", parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label>CTR (%)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.ctr || 0}
              onChange={(e) => updateField("ctr", parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label>CPA</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.cpa || 0}
              onChange={(e) => updateField("cpa", parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label>CPC</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.cpc || 0}
              onChange={(e) => updateField("cpc", parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label>Alcance</Label>
            <Input
              type="number"
              value={formData.alcance || 0}
              onChange={(e) => updateField("alcance", parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Guardar Cambios
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
