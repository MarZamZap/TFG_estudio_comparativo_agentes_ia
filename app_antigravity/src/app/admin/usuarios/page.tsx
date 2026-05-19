import { getUsuarios } from "@/actions/usuario"
import { UsuariosClient } from "@/components/admin/usuarios-client"

export default async function UsuariosPage() {
    const usuarios = await getUsuarios()

    const serializedUsuarios = usuarios.map(u => ({
        id: u.id,
        nombre: u.nombre,
        username: u.username,
        createdAtStr: u.createdAt.toLocaleDateString("es-ES")
    }))

    return (
        <div className="flex flex-col gap-6 min-w-0">
            <div>
                <h3 className="text-xl font-semibold text-slate-800">Manejo de Usuarios</h3>
                <p className="text-sm text-slate-500">
                    Gestione los accesos y credenciales del personal al sistema.
                </p>
            </div>

            <UsuariosClient usuarios={serializedUsuarios} />
        </div>
    )
}
