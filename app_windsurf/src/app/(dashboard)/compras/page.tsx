import { getCompras } from "@/actions/compras";
import { ComprasClient } from "./compras-client";
import { serialize } from "@/lib/serialize";

export default async function ComprasPage() {
  const compras = await getCompras();
  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-lg font-bold tracking-tight">Compras</h1>
        <p className="text-xs text-muted-foreground/70 mt-0.5">Registro de compras a proveedores</p>
      </div>
      <ComprasClient data={serialize(compras)} />
    </div>
  );
}
