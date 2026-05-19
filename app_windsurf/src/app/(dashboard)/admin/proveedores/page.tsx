import { getProveedores } from "@/actions/proveedores";
import { ProveedoresClient } from "./proveedores-client";

export default async function ProveedoresPage() {
  const proveedores = await getProveedores();
  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-lg font-bold tracking-tight">Proveedores</h1>
        <p className="text-xs text-muted-foreground/70 mt-0.5">Gestión de proveedores y suministradores</p>
      </div>
      <ProveedoresClient data={JSON.parse(JSON.stringify(proveedores))} />
    </div>
  );
}
