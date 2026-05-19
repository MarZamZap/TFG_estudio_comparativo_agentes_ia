"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, Store, ShoppingCart, TrendingUp, Truck, ArrowLeftRight, AlertTriangle } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import { getVentasPorTienda, getVolumenDiario, getTopProductos, getKpisTienda } from "@/actions/estadisticas";

const COLORS = ["#2563eb", "#7c3aed", "#db2777", "#ea580c", "#16a34a", "#0891b2"];

interface Tienda { id: number; nombre: string; }
interface Kpis {
  ventas: number;
  compras: number;
  traspasos: number;
  facturacion: number;
  stockBajo: number;
}

interface Props {
  ventasPorTienda: { tienda: string; total: number; cantidad: number }[];
  volumenDiario: { fecha: string; total: number; cantidad: number }[];
  topProductos: { producto: string; cantidadVendida: number; totalVentas: number }[];
  tiendas: Tienda[];
  kpisIniciales: Kpis;
}

// Quick date preset helpers
function toISO(d: Date) {
  return d.toISOString().split("T")[0];
}

const PRESETS = [
  {
    label: "Hoy",
    get: () => { const h = toISO(new Date()); return { desde: h, hasta: h }; },
  },
  {
    label: "Semana",
    get: () => {
      const hasta = new Date();
      const desde = new Date(hasta);
      desde.setDate(desde.getDate() - 6);
      return { desde: toISO(desde), hasta: toISO(hasta) };
    },
  },
  {
    label: "Mes",
    get: () => {
      const n = new Date();
      return { desde: toISO(new Date(n.getFullYear(), n.getMonth(), 1)), hasta: toISO(n) };
    },
  },
  {
    label: "Año",
    get: () => {
      const n = new Date();
      return { desde: toISO(new Date(n.getFullYear(), 0, 1)), hasta: toISO(n) };
    },
  },
  {
    label: "Todo",
    get: () => ({ desde: "", hasta: "" }),
  },
] as const;

export function EstadisticasClient({
  ventasPorTienda: initialVPT,
  volumenDiario: initialVD,
  topProductos: initialTP,
  tiendas,
  kpisIniciales,
}: Props) {
  const formatEUR = (v: number) =>
    v.toLocaleString("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [activePreset, setActivePreset] = useState<string>("Todo");
  const [tiendaId, setTiendaId] = useState<number | undefined>(undefined);

  const [ventasPorTienda, setVentasPorTienda] = useState(initialVPT);
  const [volumenDiario, setVolumenDiario] = useState(initialVD);
  const [topProductos, setTopProductos] = useState(initialTP);
  const [kpis, setKpis] = useState<Kpis>(kpisIniciales);
  const [isPending, startTransition] = useTransition();

  const fetchAll = (desde: string, hasta: string, tid?: number) => {
    startTransition(async () => {
      const [vpt, vd, tp, k] = await Promise.all([
        getVentasPorTienda(desde || undefined, hasta || undefined, tid),
        getVolumenDiario(desde || undefined, hasta || undefined, tid),
        getTopProductos(5, desde || undefined, hasta || undefined, tid),
        getKpisTienda(desde || undefined, hasta || undefined, tid),
      ]);
      setVentasPorTienda(vpt);
      setVolumenDiario(vd);
      setTopProductos(tp);
      setKpis(k);
    });
  };

  const applyPreset = (preset: (typeof PRESETS)[number]) => {
    const { desde, hasta } = preset.get();
    setFechaDesde(desde);
    setFechaHasta(hasta);
    setActivePreset(preset.label);
    fetchAll(desde, hasta, tiendaId);
  };

  const handleFilter = () => {
    setActivePreset("");
    fetchAll(fechaDesde, fechaHasta, tiendaId);
  };

  const handleClear = () => {
    setFechaDesde("");
    setFechaHasta("");
    setTiendaId(undefined);
    setActivePreset("Todo");
    fetchAll("", "", undefined);
  };

  const hasFilters = fechaDesde || fechaHasta || tiendaId !== undefined;
  const selectedTiendaNombre = tiendaId
    ? (tiendas.find((t) => t.id === tiendaId)?.nombre ?? "Tienda")
    : null;

  // Subtitle for KPIs section
  const periodoLabel =
    fechaDesde && fechaHasta
      ? `${fechaDesde} → ${fechaHasta}`
      : fechaDesde
      ? `Desde ${fechaDesde}`
      : fechaHasta
      ? `Hasta ${fechaHasta}`
      : "Todo el tiempo";

  const kpiCards = [
    {
      label: "Facturación",
      value: formatEUR(kpis.facturacion),
      icon: TrendingUp,
      bar: "accent-bar-violet",
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      alert: false,
    },
    {
      label: "Ventas",
      value: kpis.ventas.toString(),
      icon: ShoppingCart,
      bar: "accent-bar-cyan",
      iconBg: "bg-cyan-50",
      iconColor: "text-cyan-600",
      alert: false,
    },
    {
      label: "Compras",
      value: kpis.compras.toString(),
      icon: Truck,
      bar: "accent-bar-amber",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      alert: false,
    },
    {
      label: "Traspasos",
      value: kpis.traspasos.toString(),
      icon: ArrowLeftRight,
      bar: "accent-bar-emerald",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      alert: false,
    },
    {
      label: "Stock Bajo",
      value: kpis.stockBajo.toString(),
      icon: AlertTriangle,
      bar: kpis.stockBajo > 0 ? "accent-bar-rose" : "accent-bar-slate",
      iconBg: kpis.stockBajo > 0 ? "bg-rose-100" : "bg-slate-100",
      iconColor: kpis.stockBajo > 0 ? "text-rose-600" : "text-slate-400",
      alert: kpis.stockBajo > 0,
    },
  ];

  return (
    <div className="space-y-4">
      {/* ── Filter bar ── */}
      <div className="p-3 bg-card rounded-lg border border-border space-y-3">
        {/* Row 1: store + date range + apply */}
        <div className="flex flex-wrap items-end gap-3">
          {/* Store pills */}
          <div className="space-y-1">
            <Label className="text-xs flex items-center gap-1">
              <Store className="h-3 w-3" /> Tienda
            </Label>
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => { setTiendaId(undefined); fetchAll(fechaDesde, fechaHasta, undefined); }}
                className={`h-8 px-3 rounded-md text-xs font-medium border transition-colors ${
                  tiendaId === undefined
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-input hover:bg-accent"
                }`}
              >
                Todas
              </button>
              {tiendas.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setTiendaId(t.id); fetchAll(fechaDesde, fechaHasta, t.id); }}
                  className={`h-8 px-3 rounded-md text-xs font-medium border transition-colors ${
                    tiendaId === t.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-input hover:bg-accent"
                  }`}
                >
                  {t.nombre}
                </button>
              ))}
            </div>
          </div>

          {/* Date inputs */}
          <div className="space-y-1">
            <Label className="text-xs">Desde</Label>
            <Input
              type="date"
              className="h-8 w-40"
              value={fechaDesde}
              onChange={(e) => { setFechaDesde(e.target.value); setActivePreset(""); }}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Hasta</Label>
            <Input
              type="date"
              className="h-8 w-40"
              value={fechaHasta}
              onChange={(e) => { setFechaHasta(e.target.value); setActivePreset(""); }}
            />
          </div>

          <Button size="sm" onClick={handleFilter} disabled={isPending}>
            <Search className="h-3.5 w-3.5 mr-1" />
            {isPending ? "Cargando..." : "Filtrar"}
          </Button>
          {hasFilters && (
            <Button size="sm" variant="outline" onClick={handleClear} disabled={isPending}>
              Limpiar
            </Button>
          )}
        </div>

        {/* Row 2: quick presets */}
        <div className="flex items-center gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              disabled={isPending}
              className={`h-7 px-3 rounded-full text-[11px] font-semibold border transition-all ${
                activePreset === p.label
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-background border-input text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Transactional KPIs ── */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
            Métricas del período
          </p>
          <span className="text-[11px] text-muted-foreground bg-slate-100 px-2 py-0.5 rounded-full">
            {periodoLabel}
            {selectedTiendaNombre ? ` · ${selectedTiendaNombre}` : ""}
          </span>
        </div>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {kpiCards.map((kpi) => (
            <div
              key={kpi.label}
              className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 ${kpi.bar} ${
                kpi.alert ? "border-rose-200 bg-rose-50/30" : "border-slate-200"
              } ${isPending ? "opacity-60" : ""}`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 truncate">
                      {kpi.label}
                    </p>
                    <p
                      className={`text-2xl font-bold tracking-tight mt-1.5 ${
                        kpi.alert ? "text-rose-600" : "text-slate-900"
                      }`}
                    >
                      {kpi.value}
                    </p>
                  </div>
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-xl ${kpi.iconBg} shrink-0`}
                  >
                    <kpi.icon className={`h-3.5 w-3.5 ${kpi.iconColor}`} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Facturación por Tienda</CardTitle>
          </CardHeader>
          <CardContent>
            {ventasPorTienda.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Sin datos de ventas</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ventasPorTienda}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tienda" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => formatEUR(value)} />
                  <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} name="Total €" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Top 5 Productos Más Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            {topProductos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Sin datos</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={topProductos}
                    dataKey="cantidadVendida"
                    nameKey="producto"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ producto, cantidadVendida }: { producto: string; cantidadVendida: number }) =>
                      `${producto.substring(0, 15)}... (${cantidadVendida})`
                    }
                  >
                    {topProductos.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Volumen de Operaciones Diarias</CardTitle>
        </CardHeader>
        <CardContent>
          {volumenDiario.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Sin datos de operaciones</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={volumenDiario}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k€`} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    name === "total" ? formatEUR(value) : value,
                    name === "total" ? "Facturación" : "Nº Operaciones",
                  ]}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="total"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                  name="total"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="cantidad"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={false}
                  name="cantidad"
                />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
