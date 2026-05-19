"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import React from "react";
import { UserCircle } from "lucide-react";

const pathLabels: Record<string, string> = {
  "": "Inicio",
  clientes: "Clientes",
  nuevo: "Nuevo",
  nueva: "Nueva",
  historial: "Historial Clínico",
  ventas: "Ventas",
  compras: "Compras",
  traspasos: "Traspasos",
  catalogo: "Catálogo",
  inventario: "Inventario",
  estadisticas: "Estadísticas",
  admin: "Administración",
  tiendas: "Tiendas",
  proveedores: "Proveedores",
  usuarios: "Usuarios",
  categorias: "Categorías",
  "ia-log": "Log IA",
  caja: "Caja",
};

export function AppHeader() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const { data: session } = useSession();

  const now = new Date();
  const dateStr = now.toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  const userName = session?.user?.name;

  return (
    <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-border bg-white/80 backdrop-blur-sm px-4 shadow-sm">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1 h-7 w-7 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors" />
        <Separator orientation="vertical" className="h-4 bg-slate-200" />
        <Breadcrumb>
          <BreadcrumbList className="text-[12px]">
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="text-slate-400 hover:text-slate-700 transition-colors">Inicio</BreadcrumbLink>
            </BreadcrumbItem>
            {segments.map((segment, index) => {
              const href = "/" + segments.slice(0, index + 1).join("/");
              const label = pathLabels[segment] || segment;
              return (
                <React.Fragment key={href}>
                  <BreadcrumbSeparator className="text-slate-300" />
                  <BreadcrumbItem>
                    {index === segments.length - 1 ? (
                      <span className="text-slate-700 font-semibold">{label}</span>
                    ) : (
                      <BreadcrumbLink href={href} className="text-slate-400 hover:text-slate-700 transition-colors">{label}</BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex items-center gap-2 text-[11px] text-slate-400 select-none">
        {userName && (
          <>
            <UserCircle className="h-3.5 w-3.5 text-indigo-400" />
            <span className="hidden sm:inline font-semibold text-slate-600">{userName}</span>
            <span className="hidden sm:inline text-slate-300">·</span>
          </>
        )}
        <span className="capitalize">{dateStr}</span>
      </div>
    </header>
  );
}
