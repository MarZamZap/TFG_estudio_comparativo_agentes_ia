import { getProveedores } from "@/actions/proveedor"
import { ProveedoresClient } from "@/components/admin/proveedores-client"

export const dynamic = "force-dynamic";

export default async function ProveedoresPage() {
    const res = await getProveedores();
    const proveedores = res.success ? (res.data ?? []) : [];
    // Serialize dates to plain objects
    const serialized = proveedores.map(p => ({
        id: p.id,
        nombre: p.nombre,
        cif: p.cif,
        telefono: p.telefono,
        email: p.email,
        direccion: p.direccion,
        _count: p._count
    }));
    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500 min-w-0">
            <ProveedoresClient proveedores={serialized} />
        </div>
    )
}
