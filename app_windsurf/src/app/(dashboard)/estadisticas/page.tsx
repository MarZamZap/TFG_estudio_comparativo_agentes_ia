import { prisma } from "@/lib/prisma";
import { getVentasPorTienda, getVolumenDiario, getTopProductos, getKpisTienda } from "@/actions/estadisticas";
import { getTiendas } from "@/actions/tiendas";
import { EstadisticasClient } from "./estadisticas-client";
import { Users, Package, Store } from "lucide-react";

async function getGlobalStats() {
  const [totalClientes, totalProductos, totalTiendas] = await Promise.all([
    prisma.cliente.count(),
    prisma.producto.count({ where: { activo: true } }),
    prisma.tienda.count({ where: { activa: true } }),
  ]);
  return { totalClientes, totalProductos, totalTiendas };
}

export default async function EstadisticasPage() {
  const [globalStats, ventasPorTienda, volumenDiario, topProductos, tiendas, kpisIniciales] = await Promise.all([
    getGlobalStats(),
    getVentasPorTienda(),
    getVolumenDiario(),
    getTopProductos(5),
    getTiendas(),
    getKpisTienda(),
  ]);

  const globalKpis = [
    { label: "Clientes", value: globalStats.totalClientes.toString(), sub: "Registrados", icon: Users, bar: "accent-bar-emerald", iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
    { label: "Productos", value: globalStats.totalProductos.toString(), sub: "Activos en catálogo", icon: Package, bar: "accent-bar-indigo", iconBg: "bg-indigo-50", iconColor: "text-indigo-600" },
    { label: "Tiendas", value: globalStats.totalTiendas.toString(), sub: "Tiendas activas", icon: Store, bar: "accent-bar-slate", iconBg: "bg-slate-100", iconColor: "text-slate-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold tracking-tight text-slate-900">Estadísticas</h1>
        <p className="text-xs text-muted-foreground/70 mt-0.5">Dashboard analítico de operaciones</p>
      </div>

      {/* Global KPIs — no dependen de tienda */}
      <div className="grid gap-4 md:grid-cols-3">
        {globalKpis.map((kpi) => (
          <div key={kpi.label} className={`bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 ${kpi.bar}`}>
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{kpi.label}</p>
                  <p className="text-3xl font-bold tracking-tight mt-2 data-value text-slate-900">{kpi.value}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{kpi.sub}</p>
                </div>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${kpi.iconBg} shrink-0`}>
                  <kpi.icon className={`h-4 w-4 ${kpi.iconColor}`} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts + KPIs por tienda (con filtro) */}
      <EstadisticasClient
        ventasPorTienda={ventasPorTienda}
        volumenDiario={volumenDiario}
        topProductos={topProductos}
        tiendas={tiendas.map((t) => ({ id: t.id, nombre: t.nombreComercial }))}
        kpisIniciales={kpisIniciales}
      />
    </div>
  );
}
