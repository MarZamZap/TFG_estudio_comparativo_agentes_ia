"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutList, Wallet, Truck, Store } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
    {
        title: "Categorías",
        href: "/gestion/categorias",
        icon: LayoutList,
    },
    {
        title: "Proveedores",
        href: "/gestion/proveedores",
        icon: Truck,
    },
    {
        title: "Flujo de Caja",
        href: "/gestion/caja",
        icon: Wallet,
    },
    {
        title: "Tiendas / Sucursales",
        href: "/gestion/tiendas",
        icon: Store,
    },
]

export function GestionNav() {
    const pathname = usePathname()

    return (
        <nav className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0">
            {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href)
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors",
                            isActive
                                ? "bg-indigo-600 text-white shadow-sm"
                                : "hover:bg-slate-100 text-slate-700 bg-white shadow-sm ring-1 ring-slate-200/50"
                        )}
                    >
                        <item.icon className="h-4 w-4" />
                        {item.title}
                    </Link>
                )
            })}
        </nav>
    )
}
