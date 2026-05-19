import prisma from "@/lib/prisma"
import { CajaClient } from "@/components/admin/caja-client"

export const dynamic = "force-dynamic";

export default async function CajaPage() {
    const movimientos = await prisma.cajaMovimiento.findMany({
        orderBy: { fecha: 'desc' },
        include: {
            operacion: {
                select: {
                    id: true,
                    tipo: true,
                    usuario: { select: { nombre: true } }
                }
            }
        }
    })

    const ingresos = movimientos.filter(m => m.tipoMovimiento === 'INGRESO').reduce((acc, m) => acc + Number(m.monto), 0)
    const egresos = movimientos.filter(m => m.tipoMovimiento === 'EGRESO').reduce((acc, m) => acc + Number(m.monto), 0)
    const balance = ingresos - egresos

    const serializedMovimientos = movimientos.map(m => ({
        id: m.id,
        fecha: m.fecha.toISOString(),
        tipoMovimiento: m.tipoMovimiento,
        monto: Number(m.monto),
        concepto: m.concepto,
        operacionToken: m.operacion?.id || null,
        responsable: m.operacion?.usuario.nombre || 'Sistema'
    }))

    return (
        <div>
            <div className="mb-6">
                <h3 className="text-xl font-bold tracking-tight text-slate-800">Flujo de Caja</h3>
                <p className="text-sm text-slate-500">Auditoría centralizada de balances operativos.</p>
            </div>

            <CajaClient
                movimientos={serializedMovimientos}
                ingresos={ingresos}
                egresos={egresos}
                balance={balance}
            />
        </div>
    )
}
