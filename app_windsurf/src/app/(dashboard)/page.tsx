import { Users, Package, ShoppingCart, TrendingUp, Truck, ArrowLeftRight } from "lucide-react";
import Link from "next/link";

const quickLinks = [
  { title: "Clientes", href: "/clientes", icon: Users, color: "text-emerald-600", bg: "bg-emerald-50", ring: "hover:ring-emerald-200" },
  { title: "Ventas", href: "/ventas", icon: ShoppingCart, color: "text-indigo-600", bg: "bg-indigo-50", ring: "hover:ring-indigo-200" },
  { title: "Compras", href: "/compras", icon: Truck, color: "text-amber-600", bg: "bg-amber-50", ring: "hover:ring-amber-200" },
  { title: "Traspasos", href: "/traspasos", icon: ArrowLeftRight, color: "text-cyan-600", bg: "bg-cyan-50", ring: "hover:ring-cyan-200" },
  { title: "Catálogo", href: "/catalogo", icon: Package, color: "text-blue-600", bg: "bg-blue-50", ring: "hover:ring-blue-200" },
  { title: "Estadísticas", href: "/estadisticas", icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-50", ring: "hover:ring-violet-200" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Panel de Control</h1>
          <p className="text-slate-400 text-sm mt-0.5">Accesos rápidos a las secciones principales</p>
        </div>
        <span className="hidden md:block text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
          {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
        </span>
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Accesos Rápidos</h2>
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <div className={`group bg-white rounded-xl border border-slate-200 hover:border-transparent hover:shadow-md ring-2 ring-transparent ${link.ring} transition-all duration-200 cursor-pointer`}>
                <div className="flex flex-col items-center justify-center py-6 gap-2.5">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${link.bg} group-hover:scale-110 transition-transform duration-200`}>
                    <link.icon className={`h-5 w-5 ${link.color}`} />
                  </div>
                  <span className="text-[12px] font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">{link.title}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
