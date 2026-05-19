import { getTiendas } from "@/actions/tiendas";
import { TiendasClient } from "./tiendas-client";

export default async function TiendasPage() {
  const tiendas = await getTiendas();
  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-lg font-bold tracking-tight">Tiendas</h1>
        <p className="text-xs text-muted-foreground/70 mt-0.5">Gestión de puntos de venta</p>
      </div>
      <TiendasClient data={JSON.parse(JSON.stringify(tiendas))} />
    </div>
  );
}
