import { getStock } from "@/actions/stock";
import { getTiendas } from "@/actions/tiendas";
import { getProductos } from "@/actions/productos";
import { InventarioClient } from "./inventario-client";
import { serialize } from "@/lib/serialize";

export default async function InventarioPage() {
  const [stock, tiendas, productos] = await Promise.all([getStock(), getTiendas(), getProductos()]);
  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-lg font-bold tracking-tight">Monitor de Inventario</h1>
        <p className="text-xs text-muted-foreground/70 mt-0.5">Control de existencias por tienda y producto</p>
      </div>
      <InventarioClient
        data={serialize(stock)}
        tiendas={serialize(tiendas)}
        productos={serialize(productos)}
      />
    </div>
  );
}

