import { getProductos } from "@/actions/productos";
import { getCategorias } from "@/actions/categorias";
import { getProveedores } from "@/actions/proveedores";
import { CatalogoClient } from "./catalogo-client";
import { serialize } from "@/lib/serialize";

export default async function CatalogoPage() {
  const [productos, categorias, proveedores] = await Promise.all([
    getProductos(),
    getCategorias(),
    getProveedores(),
  ]);
  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-lg font-bold tracking-tight">Catálogo de Productos</h1>
        <p className="text-xs text-muted-foreground/70 mt-0.5">Gestión del catálogo con atributos técnicos</p>
      </div>
      <CatalogoClient
        data={serialize(productos)}
        categorias={serialize(categorias)}
        proveedores={serialize(proveedores)}
      />
    </div>
  );
}
