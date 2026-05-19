import { getProducto } from "@/actions/productos";
import { getCategorias } from "@/actions/categorias";
import { getProveedores } from "@/actions/proveedores";
import { notFound } from "next/navigation";
import { ProductoForm } from "../producto-form";

export default async function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [producto, categorias, proveedores] = await Promise.all([
    getProducto(Number(id)),
    getCategorias(),
    getProveedores(),
  ]);
  if (!producto) notFound();
  return (
    <div className="space-y-3">
      <h1 className="text-lg font-bold tracking-tight">Editar Producto</h1>
      <ProductoForm
        producto={JSON.parse(JSON.stringify(producto))}
        categorias={JSON.parse(JSON.stringify(categorias))}
        proveedores={JSON.parse(JSON.stringify(proveedores))}
      />
    </div>
  );
}
