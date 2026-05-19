"use client"

import { LogOut, UserCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { logoutAction } from "@/actions/auth"
import {
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar"

export function SidebarProfile({
    usuarioNombre,
    tiendaNombre
}: {
    usuarioNombre: string;
    tiendaNombre?: string
}) {
    const router = useRouter()

    const handleLogout = async () => {
        await logoutAction()
        router.push("/login")
        router.refresh()
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                    onClick={handleLogout}
                    className="h-12 w-full flex items-center justify-between text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                    <div className="flex items-center gap-2 overflow-hidden">
                        <UserCircle className="h-5 w-5 shrink-0" />
                        <div className="flex flex-col items-start text-xs truncate">
                            <span className="font-semibold text-slate-700 truncate w-full">{usuarioNombre}</span>
                            <span className="text-[10px] uppercase text-slate-400 truncate w-full">{tiendaNombre || "Óptica"}</span>
                        </div>
                    </div>
                    <LogOut className="h-4 w-4 shrink-0" />
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
