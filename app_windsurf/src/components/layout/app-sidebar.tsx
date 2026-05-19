"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  ShoppingCart,
  Package,
  Truck,
  ArrowLeftRight,
  BarChart3,
  Store,
  UserCog,
  FolderTree,
  Boxes,
  LogOut,
  Handshake,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { signOut } from "next-auth/react";

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  color: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navigation: NavGroup[] = [
  {
    label: "Principal",
    items: [
      { title: "Inicio", href: "/", icon: Home, color: "text-slate-500" },
      { title: "Estadísticas", href: "/estadisticas", icon: BarChart3, color: "text-violet-500" },
    ],
  },
  {
    label: "Gestión Clínica",
    items: [
      { title: "Clientes", href: "/clientes", icon: Users, color: "text-emerald-600" },
    ],
  },
  {
    label: "Comercial",
    items: [
      { title: "Ventas", href: "/ventas", icon: ShoppingCart, color: "text-indigo-600" },
      { title: "Compras", href: "/compras", icon: Truck, color: "text-amber-600" },
      { title: "Traspasos", href: "/traspasos", icon: ArrowLeftRight, color: "text-cyan-600" },
      { title: "Caja", href: "/caja", icon: Wallet, color: "text-emerald-600" },
    ],
  },
  {
    label: "Inventario",
    items: [
      { title: "Catálogo", href: "/catalogo", icon: Package, color: "text-blue-600" },
      { title: "Stock", href: "/inventario", icon: Boxes, color: "text-teal-600" },
    ],
  },
  {
    label: "Administración",
    items: [
      { title: "Tiendas", href: "/admin/tiendas", icon: Store, color: "text-slate-500" },
      { title: "Proveedores", href: "/admin/proveedores", icon: Handshake, color: "text-slate-500" },
      { title: "Usuarios", href: "/admin/usuarios", icon: UserCog, color: "text-slate-500" },
      { title: "Categorías", href: "/admin/categorias", icon: FolderTree, color: "text-slate-500" },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3.5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm shadow-indigo-200">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
            </svg>
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold tracking-tight text-slate-800">ÓpticaApp</span>
            <p className="text-[10px] leading-none text-slate-400 mt-0.5">Gestión Óptica</p>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent className="pt-1">
        {navigation.map((group) => (
          <SidebarGroup key={group.label} className="px-2 py-0">
            <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 px-2 py-1.5 mb-0">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={isActive}
                        render={<Link href={item.href} />}
                        className="h-8 rounded-lg transition-all duration-150 data-[active=true]:bg-indigo-50 data-[active=true]:text-indigo-700 data-[active=true]:font-semibold hover:bg-slate-100"
                      >
                        <item.icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-indigo-600" : item.color}`} />
                        <span className="text-[13px]">{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarSeparator className="bg-sidebar-border" />
      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all duration-150"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="text-[13px]">Cerrar Sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
