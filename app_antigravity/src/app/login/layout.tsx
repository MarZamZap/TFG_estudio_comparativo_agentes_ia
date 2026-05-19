import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Iniciar Sesión | Sistema Óptica",
    description: "Acceso al Sistema de Gestión Óptica",
}

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            {children}
        </div>
    )
}
