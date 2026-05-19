import { getTraspasos } from "@/actions/traspasos";
import { TraspasosClient } from "./traspasos-client";

export default async function TraspasosPage() {
  const traspasos = await getTraspasos();
  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-lg font-bold tracking-tight">Traspasos</h1>
        <p className="text-xs text-muted-foreground/70 mt-0.5">Redistribución de inventario entre tiendas</p>
      </div>
      <TraspasosClient data={JSON.parse(JSON.stringify(traspasos))} />
    </div>
  );
}
