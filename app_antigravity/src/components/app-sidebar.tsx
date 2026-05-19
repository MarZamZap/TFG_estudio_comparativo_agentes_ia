import { Home, Settings, Users, Package, ShoppingCart, PackagePlus, ArrowRightLeft, LayoutDashboard, Briefcase } from "lucide-react"
import { verifySession } from "@/lib/session"
import { SidebarProfile } from "./sidebar-profile"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Menu items.
const items = [
  {
    title: "Acceso Rápido",
    url: "/",
    icon: Home,
  },
  {
    title: "Estadísticas",
    url: "/estadisticas",
    icon: LayoutDashboard,
  },
  {
    title: "Ventas (TPV)",
    url: "/operaciones",
    icon: ShoppingCart,
  },
  {
    title: "Compras y Abastecimiento",
    url: "/compras",
    icon: PackagePlus,
  },
  {
    title: "Traspasos entre Tiendas",
    url: "/traspasos",
    icon: ArrowRightLeft,
  },
  {
    title: "Clientes & Clínico",
    url: "/clientes",
    icon: Users,
  },
  {
    title: "Catálogo e Inventario",
    url: "/inventario",
    icon: Package,
  },
  {
    title: "Gestión",
    url: "/gestion",
    icon: Briefcase,
  },
  {
    title: "Configuración",
    url: "/admin",
    icon: Settings,
  },
]

export async function AppSidebar() {
  const { session } = await verifySession()

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Gestión Óptica</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {session && (
        <SidebarFooter>
          <SidebarProfile usuarioNombre={session.nombre} />
        </SidebarFooter>
      )}
    </Sidebar>
  )
}
