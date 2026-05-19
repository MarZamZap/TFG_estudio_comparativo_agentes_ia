import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Users, ShoppingCart, PackageOpen, LayoutDashboard, Settings, FileText, ArrowRightLeft, Briefcase } from "lucide-react"

export const dynamic = "force-dynamic"

const QUICK_ACTIONS = [
  {
    title: "Punto de Venta",
    description: "Registrar nuevas ventas a clientes y facturación.",
    icon: ShoppingCart,
    href: "/operaciones",
    color: "text-blue-500",
    bg: "bg-blue-50",
    border: "hover:border-blue-200 hover:ring-blue-100",
  },
  {
    title: "Clientes y Clínica",
    description: "Gestionar historial, perfiles y graduaciones de pacientes.",
    icon: Users,
    href: "/clientes",
    color: "text-emerald-500",
    bg: "bg-emerald-50",
    border: "hover:border-emerald-200 hover:ring-emerald-100",
  },
  {
    title: "Catálogo e Inventario",
    description: "Control de productos, atributos, precios y existencias.",
    icon: PackageOpen,
    href: "/inventario",
    color: "text-indigo-500",
    bg: "bg-indigo-50",
    border: "hover:border-indigo-200 hover:ring-indigo-100",
  },
  {
    title: "Traspasos de Stock",
    description: "Mover género entre sucursales.",
    icon: ArrowRightLeft,
    href: "/traspasos",
    color: "text-orange-500",
    bg: "bg-orange-50",
    border: "hover:border-orange-200 hover:ring-orange-100",
  },
  {
    title: "Historial y Operaciones",
    description: "Registro de ingresos, egresos y movimientos de caja.",
    icon: FileText,
    href: "/operaciones/historial",
    color: "text-purple-500",
    bg: "bg-purple-50",
    border: "hover:border-purple-200 hover:ring-purple-100",
  },
  {
    title: "Gestión",
    description: "Categorías, proveedores, tiendas y flujo de caja.",
    icon: Briefcase,
    href: "/gestion",
    color: "text-amber-500",
    bg: "bg-amber-50",
    border: "hover:border-amber-200 hover:ring-amber-100",
  },
  {
    title: "Estadísticas",
    description: "Dashboard financiero y métricas de rendimiento (KPIs).",
    icon: LayoutDashboard,
    href: "/estadisticas",
    color: "text-rose-500",
    bg: "bg-rose-50",
    border: "hover:border-rose-200 hover:ring-rose-100",
  },
  {
    title: "Configuración",
    description: "Ajustes de perfil, seguridad y usuarios del sistema.",
    icon: Settings,
    href: "/admin",
    color: "text-slate-500",
    bg: "bg-slate-50",
    border: "hover:border-slate-300 hover:ring-slate-100",
  },
]

export default function Home() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto p-4 md:p-10 animate-in fade-in duration-700 min-w-0">

      {/* Cabecera Premium */}
      <div className="flex flex-col items-center text-center gap-3 py-8">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-2xl mb-2">
          <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center transform -rotate-6 shadow-sm">
            <span className="text-white font-bold text-xl">O</span>
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-800">
          Centro Óptico <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Smart</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mt-2 font-medium">
          Plataforma unificada de gestión. Selecciona un módulo para comenzar tu jornada.
        </p>
      </div>

      {/* Grid de Accesos Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {QUICK_ACTIONS.map((action, idx) => (
          <Link href={action.href} key={idx} className="group outline-none">
            <Card className={`h-full border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ring-2 ring-transparent ${action.border} bg-white`}>
              <CardContent className="p-6 flex flex-col items-start gap-4 h-full relative overflow-hidden">
                <div className={`p-3 rounded-2xl ${action.bg} ${action.color} transition-colors group-hover:scale-110 duration-300`}>
                  <action.icon className="h-6 w-6" strokeWidth={2} />
                </div>

                <div className="space-y-1.5 mt-2 z-10 w-full">
                  <h3 className="font-bold text-lg tracking-tight text-slate-800 group-hover:text-indigo-600 transition-colors flex items-center justify-between">
                    {action.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-500">
                    {action.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="text-center pt-10 pb-4 text-xs font-medium text-slate-400">
        <p>Óptica Management System v1.0 • Optimizado para Gestión Multi-Tienda</p>
      </div>
    </div>
  )
}
