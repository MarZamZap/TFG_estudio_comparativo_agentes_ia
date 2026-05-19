import { getCategorias } from "@/actions/categorias";
import { getProveedores } from "@/actions/proveedores";
import { ProductoForm } from "../producto-form";

export default async function NuevoProductoPage() {
  const [categorias, proveedores] = await Promise.all([getCategorias(), getProveedores()]);
  return (
    <div className="space-y-3">
      <h1 className="text-lg font-bold tracking-tight">Nuevo Producto</h1>
      <ProductoForm
        categorias={JSON.parse(JSON.stringify(categorias))}
        proveedores={JSON.parse(JSON.stringify(proveedores))}
      />
    </div>
  );
}
