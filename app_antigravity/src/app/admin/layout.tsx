import { AdminNav } from "@/components/admin/admin-nav"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto p-4 md:p-8 animate-in fade-in duration-500 min-w-0">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-800">Configuración</h2>
                <p className="text-muted-foreground">Gestión de usuarios del sistema y ajustes de perfil personal.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                <aside className="md:w-64 flex-shrink-0">
                    <AdminNav />
                </aside>

                <div className="flex-1 min-w-0 bg-white p-6 rounded-xl shadow-sm ring-1 ring-slate-100 min-h-[500px]">
                    {children}
                </div>
            </div>
        </div>
    )
}
