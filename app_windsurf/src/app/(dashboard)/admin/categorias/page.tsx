import { getCategorias } from "@/actions/categorias";
import { CategoriasClient } from "./categorias-client";

export default async function CategoriasPage() {
  const categorias = await getCategorias();
  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-lg font-bold tracking-tight">Categorías</h1>
        <p className="text-xs text-muted-foreground/70 mt-0.5">Gestión jerárquica de categorías de productos</p>
      </div>
      <CategoriasClient data={JSON.parse(JSON.stringify(categorias))} />
    </div>
  );
}
