"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, UserCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
    {
        title: "Usuarios",
        href: "/admin/usuarios",
        icon: Users,
    },
    {
        title: "Mi Perfil",
        href: "/admin/perfil",
        icon: UserCircle,
    },
]

export function AdminNav() {
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
                                ? "bg-slate-800 text-white shadow-sm"
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
