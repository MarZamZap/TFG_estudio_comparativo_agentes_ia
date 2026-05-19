import { getVentas } from "@/actions/ventas";
import { getTiendas } from "@/actions/tiendas";
import { VentasClient } from "./ventas-client";
import { serialize } from "@/lib/serialize";

export default async function VentasPage() {
  const [ventas, tiendas] = await Promise.all([getVentas(), getTiendas()]);
  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-lg font-bold tracking-tight">Ventas</h1>
        <p className="text-xs text-muted-foreground/70 mt-0.5">Registro y gestión de operaciones de venta</p>
      </div>
      <VentasClient
        data={serialize(ventas)}
        tiendas={serialize(tiendas)}
      />
    </div>
  );
}

