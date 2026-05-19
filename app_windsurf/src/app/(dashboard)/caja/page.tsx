import { getCajaMovimientos, getResumenCaja } from "@/actions/caja";
import { getTiendas } from "@/actions/tiendas";
import { auth } from "@/lib/auth";
import { CajaClient } from "./caja-client";
import { serialize } from "@/lib/serialize";

export default async function CajaPage() {
  const [movimientos, resumen, tiendas, session] = await Promise.all([
    getCajaMovimientos(),
    getResumenCaja(),
    getTiendas(),
    auth(),
  ]);

  const idUsuario = session?.user?.id ? Number(session.user.id) : 1;

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-lg font-bold tracking-tight">Caja</h1>
        <p className="text-xs text-muted-foreground/70 mt-0.5">Movimientos financieros e ingresos/egresos</p>
      </div>
      <CajaClient
        data={serialize(movimientos)}
        resumen={resumen}
        tiendas={serialize(tiendas)}
        idUsuario={idUsuario}
      />
    </div>
  );
}
