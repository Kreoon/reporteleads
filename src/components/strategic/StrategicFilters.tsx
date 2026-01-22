import { Filter, SortAsc, SortDesc, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { DatePresetSelector } from "@/components/ui/date-preset-selector";
import { StrategicFiltersState } from "@/pages/StrategicDashboard";

interface StrategicFiltersProps {
  filters: StrategicFiltersState;
  onFiltersChange: (filters: StrategicFiltersState) => void;
  options: {
    countries: string[];
    channels: string[];
    campaignTypes: string[];
  };
}

export function StrategicFilters({ filters, onFiltersChange, options }: StrategicFiltersProps) {
  const updateFilter = <K extends keyof StrategicFiltersState>(
    key: K,
    value: StrategicFiltersState[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (
    key: "channels" | "campaignTypes",
    value: string
  ) => {
    const current = filters[key];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateFilter(key, updated);
  };

  const clearFilters = () => {
    onFiltersChange({
      dateFrom: undefined,
      dateTo: undefined,
      countries: [],
      channels: [],
      campaignTypes: [],
      sortBy: "fecha",
      sortOrder: "desc",
    });
  };

  const handleDateRangeChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    onFiltersChange({
      ...filters,
      dateFrom: range.from,
      dateTo: range.to,
    });
  };

  const hasActiveFilters =
    filters.dateFrom ||
    filters.dateTo ||
    filters.channels.length > 0 ||
    filters.campaignTypes.length > 0;

  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">Filtros</span>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4 mr-1" />
              Limpiar
            </Button>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        {/* Date Range */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-muted-foreground mb-2">
            Período
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <DatePresetSelector
              dateRange={{ from: filters.dateFrom, to: filters.dateTo }}
              onDateRangeChange={handleDateRangeChange}
              className="w-full"
            />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Channels */}
        {options.channels.length > 0 && (
          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className="text-xs text-muted-foreground mb-2">
              Canal
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {options.channels.map((channel) => (
                  <SidebarMenuItem key={channel} className="py-1">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`channel-${channel}`}
                        checked={filters.channels.includes(channel)}
                        onCheckedChange={() => toggleArrayFilter("channels", channel)}
                      />
                      <Label
                        htmlFor={`channel-${channel}`}
                        className="text-sm cursor-pointer"
                      >
                        {channel}
                      </Label>
                    </div>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Campaign Types */}
        {options.campaignTypes.length > 0 && (
          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className="text-xs text-muted-foreground mb-2">
              Tipo de Campaña
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {options.campaignTypes.map((type) => (
                  <SidebarMenuItem key={type} className="py-1">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`type-${type}`}
                        checked={filters.campaignTypes.includes(type)}
                        onCheckedChange={() => toggleArrayFilter("campaignTypes", type)}
                      />
                      <Label
                        htmlFor={`type-${type}`}
                        className="text-sm cursor-pointer capitalize"
                      >
                        {type}
                      </Label>
                    </div>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Sorting */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-xs text-muted-foreground mb-2">
            Ordenar por
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-2">
            <Select
              value={filters.sortBy}
              onValueChange={(value) => updateFilter("sortBy", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fecha">Fecha</SelectItem>
                <SelectItem value="inversion">Inversión</SelectItem>
                <SelectItem value="leads">Leads</SelectItem>
                <SelectItem value="ctr">CTR</SelectItem>
                <SelectItem value="cpa">CPA</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                variant={filters.sortOrder === "asc" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => updateFilter("sortOrder", "asc")}
              >
                <SortAsc className="w-4 h-4 mr-1" />
                Asc
              </Button>
              <Button
                variant={filters.sortOrder === "desc" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => updateFilter("sortOrder", "desc")}
              >
                <SortDesc className="w-4 h-4 mr-1" />
                Desc
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
